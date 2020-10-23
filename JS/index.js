var sw = 20, //一个方块的宽
    sh = 20, //一个方块的高
    tr = 30, //行数
    td = 30; //列数

var snake = null, //蛇的实例
    food = null, //食物的实例
    game = null;

function Square(x,y,classname){  //x y表示坐标，
    this.x = x*sw;
    this.y = y*sh;
    this.class = classname;

    this.viewContent = document.createElement('div'); //方块对应的DOM元素
    this.viewContent.className = this.class; //
    this.parent = document.getElementById('snake');//方块的父级

}

Square.prototype.create = function(){//创造方块DOM,并添到页面里
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw +'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent);
};
Square.prototype.remove = function(){
    this.parent.removeChild(this.viewContent);
};


//蛇
function Snake(){
    this.head = null; //储存蛇头的信息
    this.tail = null; //储存蛇尾的信息
    this.pos = []; //储存蛇身上每个方块的位置
    this.directionNum= { // 存储蛇的走向，用一个对象来表示
        left:{
            x:-1,
            y:0,
            rotate:180
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }


    }
}
Snake.prototype.init = function(){ //初始化
    //创建蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head = snakeHead; //储存蛇头的信息
    this.pos.push([2,0]);  //把蛇头的位置存起来

    //创建蛇身体1
    var snakeBody1 = new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]); //把蛇身1的坐标也存起来
    //创建蛇身体1
    var snakeBody2 = new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2; //把蛇尾信息存起来
    this.pos.push([0,0]);

    //形成链表关系（每个方块跟前后方块都有联系）
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    this.direction = this.directionNum.right; //默认蛇往右走
};

//获取蛇头的下一个位置对应的元素，根据元素做不同的事情
Snake.prototype.getNextPos = function(){
    var nextPos = [
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]
    //判断是否撞到自己
    var selfCollied = false;
    this.pos.forEach(function(value){
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){
            selfCollied = true;
    }
    });
    if(selfCollied){
        console.log('撞到自己了');
    
        this.strategies.die.call(this);
        game.over();
        return;
    }

    //判断是否撞墙
    if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>td-1 || nextPos[1]>tr-1){
        console.log('撞墙了！');
        this.strategies.die.call(this);
        game.over();
        return;
    }
    
    //判断是否吃到食物
    if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]){
        this.strategies.eat.call(this);
        console.log('吃到食物了');
    }

    //都不是，继续走
    this.strategies.move.call(this); // 让this指向实例Snake


};

//处理碰撞后的事
Snake.prototype.strategies = {
    move:function(format){
        //在旧蛇头的位置创建新身体
        var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        //更新链表关系
        newBody.next=this.head.next;
		newBody.next.last=newBody;
		newBody.last=null;


        //删除原蛇头
        this.head.remove();
        newBody.create();

        //创建新蛇头
        var newHead=new Square(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'snakeHead');
        
        //更新链表关系
        newHead.next=newBody;
		newHead.last=null;
        newBody.last=newHead;
        newHead.viewContent.style.transform='rotate('+this.direction.rotate+'deg)';

        newHead.create();

        this.pos.splice(0,0,[this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y]);
        this.head = newHead;

        if(!format){
            this.tail.remove();
            this.tail = this.tail.last;

            this.pos.pop();
        }
    },
    eat:function(){
        this.strategies.move.call(this,true);
        createFood();
        game.score ++;



    },
    die:function(){
        console.log('die');

    }
}

snake = new Snake();


//创建食物
function createFood(){
    var x = null,
        y = null;

    var include = true; //循环跳出的条件，true表示食物的坐标在蛇身上（继续循环），false表示不在蛇身上（不循环了）
    while(include){
        x=Math.round(Math.random()*(td-1));
        y=Math.round(Math.random()*(tr-1));
        snake.pos.forEach(function(value){
			if(x!=value[0] && y!=value[1]){
				//这个条件成立说明现在随机出来的这个坐标，在蛇身上并没有找到。
				include=false;
			}
		});


    }
    food = new Square(x,y,'food');
    food.pos=[x,y]; //存储食物的坐标
    
    var foodDom=document.querySelector('.food');
	if(foodDom){
		foodDom.style.left=x*sw+'px';
		foodDom.style.top=y*sh+'px';
	}else{
		food.create();
	}

}


//游戏逻辑
function Game(){
    this.timer = null;
    this.score = 0;
}


Game.prototype.init = function(){
    snake.init();
    createFood();

    document.onkeydown = function (event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
            case 37: 
            if(snake.direction !=snake.directionNum.right) {
            snake.direction =snake.directionNum.left;
            }
            break;
                
            case 38:
                if(snake.direction !=snake.directionNum.down) {
                snake.direction=snake.directionNum.up;
                }
                break;
                 
            case 39:
                if(snake.direction !=snake.directionNum.left) {
                snake.direction=snake.directionNum.right;
                }
                break;
                 
            case 40:
                if(snake.direction !=snake.directionNum.up) {
                    snake.direction=snake.directionNum.down;
                }
                break;
                   
        }
    }
    


	// document.onkeydown=function(event){
    //     var e = event || window.event;
    //      var keyCode = e.keyCode || e.which;
	// 	if(keyCode ==37 && snake.direction!=snake.directionNum.right){	//用户按下左键的时候，这条蛇不能是正下往右走
	// 		snake.direction=snake.directionNum.left;
	// 	}else if(keyCode ==38 && snake.direction!=snake.directionNum.down){
	// 		snake.direction=snake.directionNum.up;
	// 	}else if(keyCode ==39 && snake.direction!=snake.directionNum.left){
	// 		snake.direction=snake.directionNum.right;
	// 	}else if(keyCode ==40 && snake.direction!=snake.directionNum.up){
	// 		snake.direction=snake.directionNum.down;
	// 	}
    //  }
    
    // document.onkeydown=function(e){
        
	// 	if(e.k==37 && snake.direction!=snake.directionNum.right){	//用户按下左键的时候，这条蛇不能是正下往右走
	// 		snake.direction=snake.directionNum.left;
	// 	}else if(e.which==38 && snake.direction!=snake.directionNum.down){
	// 		snake.direction=snake.directionNum.up;
	// 	}else if(e.which==39 && snake.direction!=snake.directionNum.left){
	// 		snake.direction=snake.directionNum.right;
	// 	}else if(e.which==40 && snake.direction!=snake.directionNum.up){
	// 		snake.direction=snake.directionNum.down;
	// 	}
	// }

     this.start();
 }
 
 Game.prototype.start=function(){	//开始游戏
	this.timer=setInterval(function(){
		snake.getNextPos();
    },200);
} 
Game.prototype.over =function(){
    clearInterval(this.timer);
    alert('你的得分是' + this.score)

    var snakeWrap = document.querySelector('#snake');
    snakeWrap.innerHTML = '';

    snake = new Snake();
    game = new Game();

    var startBtnWrap = document.querySelector('.startbtn')
    startBtnWrap.style.display= 'block';

    

} 
//开启游戏
game = new Game();
var startBtn = document.querySelector('.startbtn button')
startBtn.onclick = function(){
    startBtn.parentNode.style.display = 'none';
    game.init();
};
