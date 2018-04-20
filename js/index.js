$(function(){
		
/****初始化变量****/
	var curChip = 2;//默认筹码是2， 有2,10,50,100,500
	var time = 15;//开奖间隔时间15
	var lotterytime = 18;//正在开奖时间，10s
	var waittime = 5;//空闲时间5秒
	var gametype = 0; //游戏的状态,0是可投注状态，1是正在开奖状态,2是空闲状态，3是游戏非正常状态
	var chipname = "chip0"; //筹码名称
	var chipleft = "9%";//筹码位置
	var mygold = 6000;//我的金币
	var uplimitValue = 5000;//投注上限5000
	var totalChipMoney = 0;//下注金额
	var musicBool = true;//是否开启背景音乐
	var chipdataSelf = [0,0,0,0,0,0,0,0];//8个区域自己的投注筹码
	var chipdataTotal = [0,0,0,0,0,0,0,0];//8个区域总的投注筹码

/****游戏初始化函数****/
	function init(){
		time = 15;//开奖间隔时间15
		lotterytime = 18;//正在开奖时间，10s
		waittime = 5;//空闲时间5秒
		gametype = 0; //游戏的状态,0是可投注状态，1是正在开奖状态,2是空闲状态，3是游戏非正常状态
		totalChipMoney = 0;//下注金额
		
		chipdataSelf = [0,0,0,0,0,0,0,0];//8个区域自己的投注筹码
		chipdataTotal = [0,0,0,0,0,0,0,0];//8个区域总的投注筹码
		
		game_state()
		
		/*播放开始音乐*/
		mbeigin = document.getElementById("mbegin");
		mbeigin.volume = 1;
		mbeigin.src = "./source/begin.wav"; 
		mbeigin.play();
		
		/*播放背景音乐*/
		if(musicBool)
		{
			mbg = document.getElementById("mbg");
			mbg.src = "./source/bg.wav"; 
			mbg.volume = 1;
			mbg.play();
		}	
	}

	init();

/****游戏音效****/
	$(".bgBtn").click(function(){
		if($(this).hasClass("close"))
		{
			$(this).removeClass("close")
			musicBool =true;
			if(mbg) mbg.play(); 
		}else
		{
			$(this).addClass("close")
			musicBool = false;
			if(mbg) mbg.pause(); 
		}	
	})

/****赋值我的金币****/
	$(".qb_num").text(mygold);	
	
/****充值弹窗****/
	$(".rcg_lg").click(function(){
		showcharge();
	})
	$(".charge_wrap_close").click(function(){
		hidecharge();
	})	
	//显示充值函数
	function showcharge(){
		$(".page").addClass("db");
	}	
	//隐藏充值函数
	function hidecharge(){
		$(".page").removeClass("db");
	}

/****筹码切换****/
	$(".bottom li").on("click",function(){
		chipname = "chip" + $(this).index();//修改筹码名称
		chipleft = 9 + $(this).index()*17 + "%";//修改筹码位置
		$(this).siblings("li").find("img").removeClass("current");
		$(this).find("img").addClass("current");
		//修改筹码值
		curChip = parseInt($(this).find("span").attr("data-value")) ;
	})

/****倒计时函数****/
function game_state(){
		//状态1：正常投注倒计时
		if(gametype == 0)
		{
			$(".timer").text(changeTimeType(time));
			time--;
			$(".chipTs a").attr("class","tsType t1");
			timer1 = setInterval(function(){
				thetime = changeTimeType(time);
				$(".timer").text(thetime);
				if(time == 0)
				{
					//执行等待开奖函数,清除定时器
					clearInterval(timer1);
					setTimeout(function(){
						gametype = 1;
						game_state();
					},1000)	
				}
				time--;
			},1000)
		}

		//状态2：正在开奖中
		if(gametype == 1)
		{
			$(".timer").text(changeTimeType(lotterytime));
			lotterytime--;
			//游戏状态变成开牌状态
			$(".chipTs a").attr("class","tsType t2");
			
			//调用发牌函数
			dealFun({"type":1,"num":10,"point":0},{"type":2,"num":5,"point":5},{"type":2,"num":12,"point":0},{"type":4,"num":6,"point":6},{"type":3,"num":5,"point":5},{"type":4,"num":9,"point":9})
			
			
			timer2 = setInterval(function(){
				thetime = changeTimeType(lotterytime);
				$(".timer").text(thetime);
				//清空,弹出中奖情况
				if(lotterytime == 6){
					 $(".deal").empty();
					 chipdataSelf = [0,0,0,0,0,0,0,0];//8个区域自己的投注筹码
					 chipdataTotal = [0,0,0,0,0,0,0,0];//8个区域总的投注筹码
					 clearChip();
				}
				
				if(lotterytime == 4){
					$(".chipTable div").removeClass("cho");
					var resultArr = ["-1000","0","-20","0","+4000","-200","0","-20","+5000"];//每个区块的输赢数据和总的输赢数据组成的数组
					showResultTC(resultArr);
				}	
				
				if(lotterytime == 0){
					clearInterval(timer2);
					hideResultTC();
					setTimeout(function(){
						gametype = 2;
						game_state();
					},1000)	
					
				}
				lotterytime--;
			},1000)
		}	
		//状态2：空闲状态，游戏初始化准备
		if(gametype == 2)
		{
			$(".timer").text(changeTimeType(waittime));
			waittime--;
			//游戏状态变成空闲状态
			$(".chipTs a").attr("class","tsType t3");
			
			timer3 = setInterval(function(){
				thetime = changeTimeType(waittime);
				$(".timer").text(thetime);
				if(waittime == 0){
					clearInterval(timer3);
					setTimeout(function(){
						init();
					},1000)		
				}
				waittime--;
			},1000)
		}	
	}

/****点击投注****/
	$(".chipTable div").click(function(){
		//判断游戏状态,如果是非投注状态，则不执行任何操作，直接返回
		if(gametype) return;
		
		//存储this变量
		_this = this;
		
		//点击的区域0,1,2,3,4,5,6,7（闲对子，庄对子，闲，平，庄，闲天王，同点平，庄天王）
		var tarIndex = $(this).index();//当前点击的区域索引
		chipdataSelf[tarIndex] += curChip;//更新当前区域自己总的投注数量
		
		//判断金币
		moneybool = moneyFun();//金币是否足够，返回true,false
		
		//判断投注上限
		uplimitbool = uplimit(chipdataSelf[tarIndex]); //是否单个区域达到投注上限，返回true,false
		
		//金币不足，弹出充值窗口
		if(!moneybool) {
			showcharge();
			chipdataSelf[tarIndex] -= curChip;
			return;
		//单个投注上限， 弹出上限提示窗口
		}else if(!uplimitbool){
			console.log("单个区域最高投注5000金币");
			chipdataSelf[tarIndex] -= curChip;//还原当前区域所有的投注数量
			return;
		}
		
		$(this).addClass("cli");
		setTimeout(function(){
			$(_this).removeClass("cli")
		},100)	
		
		//投注成功， 减去投注金币， 更新总的投注金额和页面余额显示
		chipdataTotal[tarIndex] += curChip;//更新当前区域所有的投注数量
		mygold -= curChip;//更新我的金币总数量
		totalChipMoney = totalChipMoney + curChip;//更新我自己当前总投注金额
		$(".qb_num").text(mygold);	//更新页面余额显示
		
		//播放下注音乐
		mcoin = document.getElementById("mbegin");
		mcoin.src = "./source/coin.mp3"; 
		mcoin.volume = 1;
 		mcoin.play();
		
		//对应区域显示投注金额
		$(this).find("p").addClass("db").find(".sChip").text(chipdataSelf[tarIndex]); //当前区域自己的投注金额
		$(this).find("p").addClass("db").find(".tChip").text(chipdataTotal[tarIndex]);//当前区域总的投注金额
		
		//创建筹码并移动
		var moveChip = '<span style="left:'+chipleft+'" class="moveChip '+chipname+'"></span>';
		var targetl = $(this).offset().left;
		var targetw = $(this).innerWidth();
		var targett = $(this).offset().top;
		var targeth = $(this).innerHeight(); 
		var disl = Math.random()*(targetw - 15);
		var dist = Math.random()*(targeth - 15);
		var t_l = targetl + disl;
		var t_t = targett + dist;
		$(moveChip).appendTo("body").animate({"left":t_l,"top":t_t},function(){
			$(this).css({"left":disl,"top":dist});
			$(_this).append($(this));
		})
	})

/****判断金币是否足够****/
	function moneyFun(){
		if(mygold < curChip){
			return false;
		}else{
			return true;
		}
	}
	
/****判断是否达到投注上限****/
	function uplimit(value){
		if(value > uplimitValue){
			return false;
		}else {
			return true;
		}
	}

/****撤销****/
	$(".clear_con").on("click",function(){
		if(gametype) return; //非投注状态不能撤销
		$(".revokets").addClass("db");
	})
	
	$(".cancelBtn").click(function(){
		$(".revokets").removeClass("db");
	})
	$(".sureBtn").click(function(){
		$(".revokets").removeClass("db");
		mygold += totalChipMoney;
		$(".qb_num").text(mygold);
		clearChip();
	})
	
/****清除筹码下注****/
	function clearChip(){
		$(".moveChip").remove();
		$(".sChip").text("0");
		//更新总的投注数组
		for(var i=0;i<8;i++)
		{
			chipdataTotal[i]-=chipdataSelf[i];
			//如果当前区域总的投注为0 ，那么隐藏投注数据显示
			if(chipdataTotal[i]==0)
			{
				$(".chipTable div").eq(i).find("p").removeClass("db");
			}
		}
		//更新我的总投注金币数量
		totalChipMoney = 0;
		//更新自己的投注数组
		chipdataSelf = [0,0,0,0,0,0,0,0];//自己8个区域的投注筹码
		//调用更新投注数据显示函数
		showChipData();
	}

/****更新投注数据的显示****/
	function showChipData(){
		for(var i=0;i<8;i++)
		{
			$(".chipTable div").eq(i).find(".sChip").text(chipdataSelf[i]);
			$(".chipTable div").eq(i).find(".tChip").text(chipdataTotal[i]);
		}
	}
	
/****时间格式转换(不足10秒的前面补0)****/
	function changeTimeType(time){
		if(time<10) return "0" + time;
		return time;
	}
/****发牌函数****///参数是牌的类型{type:1,num:3,point:3}//type是花色1(方片),2(梅花),3(红桃),4(黑桃),num是牌的值（1~13），point是点数（0-9）
	function dealFun(card1,card2,card3,card4,card5,card6){
		$(".deal").append(dealHTML);
		var tPoint1 = card1.point % 10; //第一次发牌，闲的点数
		var tType1 = "card"+card1.type+"_"+card1.num;//第一张牌的类型
		var tPoint2 = card2.point % 10; //第二次发牌，庄的点数
		var tType2 = "card"+card2.type+"_"+card2.num;//第二张牌的类型
		var tPoint3 = (card1.point+card3.point) % 10; //第三次发牌，闲的点数
		var tType3 = "card"+card3.type+"_"+card3.num;//第三张牌的类型
		var tPoint4 = (card2.point+card4.point) % 10; //第四次发牌，庄的点数
		var tType4 = "card"+card4.type+"_"+card4.num;//第四张牌的类型
		if(card5) 
		{
			var tPoint5 = (card1.point+card3.point+card5.point) % 10; //第五次发牌，闲的点数
			var tType5 = "card"+card5.type+"_"+card5.num;//第五张牌的类型
		}
		if(card6) 
		{
			var tPoint6 = (card2.point+card4.point+card6.point) % 10; //第六次发牌，庄的点数
			var tType6 = "card"+card6.type+"_"+card6.num;//第六张牌的类型
		}
		
		//发前四张牌
		$(".cardBack").addClass("db").animate({"top":"0%"},400).animate({"left":"3%"},100,function(){
				$(".card1").addClass("db "+tType1);$(".xDot").attr("class","xDot db dot"+tPoint1)
			}).delay(200).animate({"top":"-300%","left":"45%"},10)/*第一张牌*/
		.animate({"top":"0%"},200).animate({"left":"87%"},100,function(){
				$(".card2").addClass("db "+tType2);$(".zDot").attr("class","zDot db dot"+tPoint2)
			}).delay(200).animate({"top":"-300%","left":"45%"},10)/*第二张牌*/
		.animate({"top":"0%"},200).animate({"left":"14%"},100,function(){
				$(".card3").addClass("db "+tType3);$(".xDot").attr("class","xDot db dot"+tPoint3)
			}).delay(200).animate({"top":"-300%","left":"45%"},10)/*第三张牌*/
		.animate({"top":"0%"},200).animate({"left":"76%"},100,function(){
				$(".card4").addClass("db "+tType4);$(".zDot").attr("class","zDot db dot"+tPoint4);$(".cardBack").removeClass("db")
			}).delay(200).animate({"top":"-300%","left":"45%"},10)/*第四张牌*/
		//发第五张牌
		if(card5)
		{
			setTimeout(function(){
				$(".dBg4").text("庄"+tPoint4+"点，闲"+tPoint3+"点，闲继续拿牌")
				$(".dBg4").addClass("db");
			},2200)
			setTimeout(function(){
				$(".cardBack").addClass("db").animate({"top":"0%"},200).animate({"left":"25%"},100,function(){
						$(".card5").addClass("db "+tType5);$(".xDot").attr("class","xDot db dot"+tPoint5);$(".cardBack").removeClass("db")
					}).delay(200).animate({"top":"-300%","left":"45%"},10,function(){
						$(".dBg4").removeClass("db");
					})/*第一张牌*/
			},3200)
		}
		//发第六张牌
		if(card6)
		{
			setTimeout(function(){
				$(".dBg4").text("闲"+tPoint5+"点，庄"+tPoint4+"点，庄继续拿牌")
				$(".dBg4").addClass("db");
			},4000)
			setTimeout(function(){
				$(".cardBack").addClass("db").animate({"top":"0%"},200).animate({"left":"65%"},100,function(){
						$(".card6").addClass("db "+tType6);$(".zDot").attr("class","zDot db dot"+tPoint6)
					}).delay(200).animate({"top":"-300%","left":"45%"},10,function(){
							$(".dBg4").removeClass("db");
							$(".cardBack").removeClass("db");
						})/*第一张牌*/
			},5000)
		}
		//根据参数个数，知道总共发几张牌
		if(arguments.length == 4)
		{
			setTimeout(showResult,2500)
		}
		if(arguments.length == 5)
		{
			setTimeout(showResult,4000)
		}
		if(arguments.length == 6)
		{
			setTimeout(showResult,5500)
		}
	}

/****开庄，闲，平翻转移动-开奖显示特效****/
function showResult(){
	//庄或者闲赢---移动庄闲显示的logo
	$(".xIcon").addClass("Win");
	//$(".zIcon").addClass("Win");
	
	//调用中奖区域闪烁函数
	flicker([2]);
	//回收金币，true是赢了，false是没有赢
	winFunc(true)

	setTimeout(function(){
		$(".xIcon,.zIcon").addClass("mv");
	},2000)
	//庄和闲平了---移动庄闲显示的logo
//			setTimeout(function(){
//				$(".xIcon,.zIcon").addClass("mp");
//				setTimeout(function(){
//					$(".pIcon").addClass("db");
//				},500)
//			},2000)
	//缩小牌的显示
	setTimeout(function(){
		$(".dBg1").remove();
		$(".dBg3").addClass("sc")
	},2500)
}

/****开奖后筹码去向(如果赢了就传参数winArg=true,输了或者没有投注就不传参数)****/
function winFunc(winArg)
{
	if(winArg)
	{
		setTimeout(function(){
			/*播放中奖音乐*/
			mwin = document.getElementById("mwin");
			mwin.volume = 1;
			mwin.src = "./source/win.wav"; 
			mwin.play();
		},1500)
	}
 	var tt = "40%";
 	var tts = $(".self").offset().top+25;
 	if(winArg) tt = tts; //如果自己赢了，金币掉落在自己位置
	setTimeout(function(){
		$(".moveChip").each(function(index,ele){
			ol = $(this).offset().left;
			ot = $(this).offset().top;
			$(this).css({
				"left":ol,
				"top":ot,
				"zIndex":100
			})
			 
			$(this).appendTo("body").animate({
					"left":"50%",
					"top":tt
				},700,function(){
					$(this).remove();
			});
		})
		$(".reward").removeClass("db");
	},3000)
}

/**显示自己的投注开奖结果，参数resultArr是每个区块的输赢数据和总的输赢数据组成的数组**/
function showResultTC(resultArr)
{	
	for(var i=0;i<9;i++)
	{
		$(".reward a").eq(i).text(resultArr[i]);
	}
	$(".reward").addClass("db");
}
/**隐藏弹窗显示结果**/
function hideResultTC()
{	
	$(".reward").removeClass("db");
	$(".reward a").text(0);
}

			 
/**中奖区域闪烁函数(总共8个区块，对应0，1,2,3,4,5,6,7)，参数place是闪烁区域数组**/
function flicker(place)
{
	for(var i=0; i<place.length; i++)
	{
		$(".chipTable div").eq(place[i]).addClass("cho")
	}
}

/**菜单栏弹出**/
	$(".note").click(function(){
		$(".note_in22").toggleClass("db")
	})

	$(document).click(function(e){
		if(e.target.className == "note"){
			return
		}else{
			$(".note_in22").removeClass("db")
		}
		
	})
	
	//游戏规则
	$(".game_rule").click(function(){
		$(".rule").addClass("db");
	})
	
	$(".pop_close,.btn_return").click(function(){
		$(".rule").removeClass("db");
	})
	
	//投注记录
	$(".record").click(function(){
		$(".record_content").addClass("db");
	})
	$(".pop_close,.btn_return").click(function(){
		$(".record_content").removeClass("db");
	})
	
	$(".record_con").click(function(){
		$(this).next(".record_more2").toggleClass("db")
	})

/****第一次进游戏提示****/
	$(".guide_one").addClass("db")
	$(".next_step").click(function(){
		$(".guide_one").removeClass("db")
		$(".guide_two").addClass("db")
	})
	$(".return_step").click(function(){
		$(".guide_two").removeClass("db")
	})
	
/****发牌特效的HTML****/
var dealHTML = '<div class="dealBg">'+
	'<div class="dBg1"><img src="img/dealBg.png" width="100%"></div>'+
	'<div class="dBg2">'+
		'<a class="xIcon"><img src="img/xIcon.png"><img class="back" src="img/xWin.png"></a>'+
		'<a class="zIcon"><img src="img/zIcon.png"><img class="back" src="img/zWin.png"></a>'+
		'<a class="pIcon"><img src="img/pWin.png"></a>'+
	'</div>'+
	'<div class="dBg3">'+
		'<a class="card cardBack"></a>'+
		'<div class="xCard"><a class="card card1"></a><a class="card card3"></a><a class="card card5"></a></div>'+
		'<div class="zCard"><a class="card card2"></a><a class="card card4"></a><a class="card card6"></a></div>'+
		'<div class="Totaldot">'+
			'<span class="xDot"></span>'+
			'<span class="zDot"></span>'+
		'</div>'+
	'</div>'+
	'<div class="dBg4">'+	
	'</div>'+
'</div>';

})