


var fun = {

test:function(){
    var cards = [];
    for(var i= 0 ;i<13;i++){
        var _temp = Math.floor( Math.random()*52);
        cards.indexOf(_temp)<0?cards.push( _temp ):i--;
    }
    console.log(cards);
    return cards;
},




// 返回对子
getDuizi:function(cards){
    // @params: cards 为后台发回来的牌组
    // 长度判断，暂不做
    var result = [];
    var numbers = fun.classifyCard(cards).numbers;
    // 得到对子
    numbers.forEach(function(data ,i){
        if( data.length == 2 ){
        // 表明有对子
        result.push( [ 13*data[0]+i ,13*data[1]+i ] );
        }
        if( data.length == 3 ){
            result.push(
                [ 13*data[0]+i ,13*data[2]+i ],
                [ 13*data[0]+i ,13*data[1]+i ],
                [ 13*data[1]+i ,13*data[2]+i ]
                );
        }
        if( data.length == 4 ){
            result.push(
                [ 13*data[0]+i ,13*data[1]+i ],
                [ 13*data[0]+i ,13*data[2]+i ],
                [ 13*data[0]+i ,13*data[3]+i ],
                [ 13*data[1]+i ,13*data[2]+i ],
                [ 13*data[1]+i ,13*data[3]+i ],
                [ 13*data[2]+i ,13*data[3]+i ]
                );
        }});
    return result;
},

// 返回三条
getSantiao:function(cards){
    var result = [];
    var numbers = fun.classifyCard(cards).numbers;
    numbers.forEach(function(data,i){
    if( data.length == 3 ){
        result.push( [ data[0]*13+i ,data[1]*13+i ,data[2]*13+i] );
    }
    if( data.length == 4){
        result.push(
            [ data[0]*13+i ,data[1]*13+i ,data[2]*13+i],
            [ data[3]*13+i ,data[1]*13+i ,data[2]*13+i],
            [ data[0]*13+i ,data[1]*13+i ,data[3]*13+i],
            [ data[0]*13+i ,data[2]*13+i ,data[3]*13+i])
        }
    })

    return result;
},
// 返回顺子
getShunzi:function(cards){
    // [4, 45, 37, 46, 6, 7, 47, 30, 13, 0, 34, 41, 5] 顺子测试集
    var result = [];
    var numbers = fun.classifyCard(cards).numbers;
    var _tempArr = [];// [[],[i ,len ]],i前的 len 个连在一起
    var len = 0;
    numbers = numbers.concat([numbers[0]]);//将A复制到前面来
    console.log(numbers)
    for(var i = 0;i<numbers.length;i++){
        if(numbers[i].length == 0){
            len > 4 ? _tempArr.push([i,len]):null;
            //console.log("leni",i,len)
            len = 0;

        }else{
            len++;
        }
        if( i==numbers.length-1 && len > 4 ){
            _tempArr.push([i+1,len]);
        }
    }
    console.log("temp",_tempArr)
    // 第一层循环，所有连成片的
    for(var i = 0 ;i<_tempArr.length; i++){
        // 第二层，单个连片的;每次取出
        for(var j = 0;j<_tempArr[i][1]-4 ;j++){//每次取5个,j 表示分片起始位置
            var _aa = _tempArr[i][0] - _tempArr[i][1] + j;//记下 numbers 连续五组的起始点
            result.push(fun.combination2([
                numbers[_aa].map(function(a,i){return   (_aa)+a*13}),
                numbers[_aa+1].map(function(a,i){return (_aa+1)+a*13}),
                numbers[_aa+2].map(function(a,i){return (_aa+2)+a*13}),
                numbers[_aa+3].map(function(a,i){return (_aa+3)+a*13}),
                numbers[_aa+4].map(function(a,i){return ((_aa+4==numbers.length-1)?(0):(_aa+4))+a*13})],5));
        }
    }
    return result;
},
// 返回同花
getTonghua:function(cards){
    // [18, 29, 24, 46, 41, 45, 51, 32, 23, 11, 20, 31, 30] 无
    // [46, 44, 35, 18, 28, 2, 34, 31, 13, 48, 22, 32, 20] 有
    var result = [];
    var colors = fun.classifyCard(cards).colors;
    colors.forEach(function(data,i){
        if(data.length > 4){
            // 还原成点数
            var _tempData = data.map(function(a){ return a+i*13 ;});
            // 排列组合 data ,并 push 到结果 result 中
            result.push( fun.combination(_tempData ,5) );
        }
    });
    console.log(result);
    return result;
},

// 返回葫芦
getHulu:function(cards){
    // [39, 27, 30, 41, 47, 3, 31, 45, 13, 26, 29, 34, 21] 存在，且交叉
    var result = [];
    var sanTiao = this.getSantiao(cards);
    var duizi = this.getDuizi(cards);
    var _temp = [];
    // 如果三条和对子都存在
    if(sanTiao.length && duizi.length){
        _temp = fun.combination2([sanTiao,duizi],2);
    }
    for(var i=0 ;i<_temp.length ;i++){
        if(_temp[i][0]%13 != _temp[i][4]%13){
            result.push(_temp[i]);
        }
    }
    return result;
},

// 返回炸弹
getZhadan:function(cards){
    var result = [];
    var numbers = fun.classifyCard(cards).numbers;
    numbers.forEach(function(data,i){
        if( data.length == 4){
            result.push([ data[0]*13 +i,data[1]*13 +i ,data[2]*13 +i ,data[3]*13 +i]);
        }
    })
    return result;
},

// 返回同花顺
getTonghuashun:function(cards){
    // [46, 44, 35, 18, 33, 2, 34, 31, 13, 48, 22, 32, 20] 有
    // [18, 29, 24, 46, 41, 45, 51, 32, 23, 11, 20, 31, 30] 无
    var result = [];
    // 判断是否为顺子
    var isShunzi = function(arr){
    // 测试成功 isShunzi([1,2,3,4,18]); isShunzi([1,2,3,4,6])
    if(arr.length < 5){
        // 之前的BUG 出现在这里。运行时传入的参数为 [[31,32,33,34,35]]
        arr = arr[0];
    }
    console.log(arr);
    var flag = true;
    var _temp = [];
    for(var i = 0 ; i<arr.length ;i++){
         _temp.push( arr[i] % 13 );
        //_temp.push( Math.floor( arr[i] / 4) );
    }
    console.log("转换后的 arr ",_temp);
    _temp.sort(function(a,b){return a-b;})
        .forEach(function(a,b){ a == _temp[0]+b ? null : flag=false;});
    // 补充 A2345 这种特殊情况
    if(!flag){
        if(_temp[0]==0 && _temp[1]==1 && _temp[2]==2 && _temp[3]==12 ){
            flag = true;
        }
    }
        // if( (_temp[0]+1 == _temp[1]) &&(_temp[0]+2 == _temp[2]) &&(_temp[0]+3 == _temp[3]) &&(_temp[0]+4 == _temp[4]));顺子的判断方法一
        console.log('是否为顺子',flag);
        return flag;
    }


    var _tempResult = this.getTonghua(cards);
    for(var i = 0; i< _tempResult.length ;i++){
        var _aa = _tempResult[i];
        console.log("发现一个疑似同花顺",_tempResult[i]);

        // 此处有问题，需要再考虑仔细，运行不通，无法判断 -- 已解决，见 @line 175
        console.log('@line 191 ',isShunzi(_aa));
        if( isShunzi( _aa ) ){
            console.log("发现一个同花顺");
            result.push( _tempResult[i] );
        }
    }
    console.log("同花顺："+result);
    return result;
}
,
// 对牌进行分类
classifyCard:function(cards){
    // 将牌进行排序分类
    // color 花色
    var colors = [
    // "黑":[],
    // "红":[],
    // "梅":[],
    // "方":[],
    // "0":[],"1":[],"2":[],"3":[]
    [],[],[],[]
    ];
    // number 点数
    var numbers = [
    // "0":[],"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[]
    // 0,1,2,3,4,5,6,7,8,9,10,11,12
    [],[],[],[],[],[],[],[],[],[],[],[],[]
    ];
    // 将牌分类;
    cards.forEach(function(card){
        // 获取花色 : 0-13 为同一花色做法
         var _color = Math.floor( card / 13 );
        // // 获取点数
         var _num = (card % 13);
        // 0-4 为一个点数写法
        //var _color = card % 4;
        // var _num = Math.floor( card / 4 );
        colors[_color].push( _num );
         numbers[_num].push(_color);
    });

    // 还原成牌的大小; 0-13 为同一花色的写法
    // colors[i][j] : card = i*13 + j;
    // numbers[i][j] : card = j*13 + i;
    // 还原成牌的大小; 0-4 为同一点数的写法
    // colors[i][j] : card = j*13 + i;
    // numbers[i][j] : card = i*13 + j;
    console.log(colors);
    //console.log(numbers);
    return {"colors":colors,"numbers":numbers};
},

// 排列组合
combination:function(arr, num){
    var r=[];
    (function f(t,a,n){
        if (n==0)
        {
            return r.push(t);
        }
        for (var i=0,l=a.length; i<=l-n; i++)
        {
            f(t.concat(a[i]), a.slice(i+1), n-1);
        }
    })([],arr,num);
    return r;
},
// 畸形排列组合 --- 用于找顺子后的排列，包含同一点数不同花数
combination2:function(arr, num){
    var r=[];
    (function f(t,a,n)
    {
        if (n==0)
        {
            return r.push(t);
        }
        for (var i=0,l=a.length; i<=l-n; i++)
        {
            for(var j=0;j<a[i].length ;j++){
                f(t.concat(a[i][j]), a.slice(i+1), n-1);
            }
        }

    })([],arr,num);
    return r;
},
// 将牌排序 -- 舍弃
sortCards:function(cards){
    var result = [];
    // 鸽巢法
    var allSort = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // 每个位置 i 代表的牌数为 (51 - i)
    for(var i = 0 ;i<cards.length ;i++){
        allSort[51-cards[i]] = 1;
    }

    for(var i = 0 ;i<52 ;i++){
        if(allSort[i]){
            result.push( 51 - i );
        }
    }
    return result;
}

}

fun.getShunzi([0,1,2,3,4,9,10,11,12,13,14,15,16])
