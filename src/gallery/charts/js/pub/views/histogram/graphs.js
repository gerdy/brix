KISSY.add('brix/gallery/charts/js/pub/views/histogram/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,Group,EventType){
	
	function Graphs(){
		
		var self = this

		Graphs.superclass.constructor.apply(self,arguments);
	}

	Graphs.ATTRS = {
		w:{
			value:100
		},
		h:{
			value:100
		},
		id:{
			value:'graphs'       //id
		},
		data:{
			value:[]             //[[{x:0,y:-100},{}],[]]
		},
		element:{
			value:null
		},
		isInduce:{
			value:0              //是否作为感应区
		},
		groupW:{
			value:59             //一组的宽
		},
		groupCount:{
			value:1              //每组中几条数据
		},		
		disGroupX:{
			value:22             //组之间距离
		},
		disGroupMinX:{
			value:2              //组之间最小距离
		},
		disGroupLimitX:{
			value:1              //组之间极限距离
		},
		disSingleX:{
			value:4              //组中支柱距离
		},
		disSingleMinX:{
			value:1              //组中支柱最小距离
		},
		singleW:{
			value:16             //支柱宽
		},
		singleMinW:{
			value:4              //支柱最小宽
		},
		intX:{
			value:16             //x是否取整
		},

		_groupMinW:{
			value:0              //每组最小的宽
		},
		_groupNormalW:{
			value:0              //每组中在正常状态下的宽
		},
		_disGroupX:{ 
			value:0              //当前 组之间距离
		},
		_disSingleX:{
			value:0              //当前 组中支柱距离    
		},
		_singleW:{ 
			value:0              //当前 支柱宽         
		},
		_groupArr:{ 
			value:[]             //group对象集合    
		},

		_groups:{ 
			value:null
		}
	}			

	S.extend(Graphs,Base,{
		init:function(){
			var self = this
			Graphs.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			self.set('_disGroupX',self.get('disGroupX'))
			self.set('_disSingleX',self.get('disSingleX'))
			self.set('_singleW',self.get('singleW'))

			self._algorithm()
			self._widget()
			self._layout()
		},
		induce:function($o,$b){
			var self = this
			self.get('_groupArr')[$o.index].induce({id:$o.id},$b)
		},
		//获取每组最小的宽
		getGroupMinW:function(){
			var self = this
			if(!self.get('_groupMinW')){
				 self.set('_groupMinW', 2 * self.get('disGroupLimitX') + self.get('groupCount') * self.get('singleMinW') + (self.get('groupCount') - 1) * self.get('disSingleMinX'))				 
			}
			return self.get('_groupMinW')
		},
		//获取每根直方信息集合 并根据每组 返回一个二维数组
		getInfos:function(){
			var self = this
			var arr = []
			for (var a = 0, al = self.get('_groupArr').length; a < al; a++ ) {
				var group = self.get('_groupArr')[a]
				var o = group.getInfos()
				
				arr.push(o)
			}
			
			//将cx属性转换成相对于this的坐标系统
			for (var b = 0, bl = arr.length; b < bl; b++ ) {
				for (var c = 0, cl = arr[b].length; c < cl; c++ ) {
					o = arr[b][c]
					o.cx = self.get('intX') ? o.cx + Global.ceil(b * self.get('groupW')) : o.cx + b * self.get('groupW')
				}
			}
			
			return arr
		},
		//获取某个直方的信息
		getNodeInfoAt:function($index, $id){
			var self = this
			var group = self.get('_groupArr')[$index]
			var o  = group.getNodeInfoAt($id)
			o.cx = Number(o.cx) + Number(group.get('element').get('_x'))
			o.x = Number(o.x) + Number(group.get('element').get('_x'))
			return o
		},

		_widget:function(){
			var self = this

			self.set('_groups', new SVGElement('g')), self.get('_groups').set('class','groups')
			self.get('element').appendChild(self.get('_groups').element)
		},

		_layout:function(){
			var self = this
			for (var a = 0, al = self.get('data').length; a < al; a++ ) {
				var group = new Group()
				self.get('_groupArr').push(group)
				var o = {
					index  : a,
					h      : self.get('h'),
					parent : self.get('_groups'),
					data   : self.get('data')[a],
					isInduce : self.get('isInduce'),
					disGroupX : self.get('_disGroupX'),
					disSingleX : self.get('_disSingleX'),
					singleW : self.get('_singleW'),
					intX   : self.get('intX')
				}
				group.init(o)
				group.get('element').on(EventType.OVER,function($o){self._overHandler($o)})
				group.get('element').on(EventType.OUT,function($o){self._outHandler($o)})

				var x = Global.ceil(self.get('groupW') * a)
				group.get('element').transformX(x)
				group.get('element').set('_index',a)
				group.get('element').set('_x',x)
			}
		},

		//获取每组正常的宽
		_getGroupNormalW:function(){
			var self = this
			if (!self.get('_groupNormalW')) {
				self.set('_groupNormalW', 2 * self.get('disGroupX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleX'))
			}
			return self.get('_groupNormalW')
		},

		//算法
	 	_algorithm:function(){
	 		var self = this
	 		self._getGroupNormalW()
	 		if (self.get('groupW') > self.get('_groupNormalW')) {
				self.set('_disGroupX', self.get('disGroupX') + (self.get('groupW') - self.get('_groupNormalW')) / 2)
			}else if (self.get('groupW') < self.get('_groupNormalW')) {
				//比正常中心+最小两端大
				if (self.get('groupW') > (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleX'))) {
					self.set('_disGroupX', (self.get('groupW') -(self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleX'))) / 2)
				}else if (self.get('groupW') < (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleX'))) {
					self.set('_disGroupX', self.get('disGroupMinX'))
					if (self.get('groupW') > (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleMinX'))) {
						self.set('_disSingleX', (self.get('groupW') - (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW'))) / (self.get('groupCount') - 1))
					}else if(self.get('groupW') < (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleMinX'))){
						self.set('_disSingleX', self.get('disSingleMinX'))
						self.set('singleW',self.get('singleW')-1)
						
						if (self.get('singleW') <= self.get('singleMinW')) {
							self.set('singleW', self.get('singleMinW'))
							self.set('disGroupMinX',self.get('disGroupMinX')-1)
							self.set('_disGroupX', self.get('disGroupMinX'))
							if (self.get('_disGroupX') <= self.get('disGroupLimitX')) {
								var scale = self.get('groupW') / (2 * self.get('disGroupLimitX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleMinX'))
								self.set('_disGroupX', scale * self.get('disGroupLimitX'))
								self.set('_disSingleX', scale * self.get('disSingleMinX'))
								self.set('_singleW', scale * self.get('singleMinW'))
								return
							}
						}
						self.set('_singleW', self.get('singleW'))
						self._algorithm()
						
					}else {
						self.set('_disSingleX', self.get('disSingleMinX'))
					}
				}else {
					self.set('_disGroupX', self.get('disGroupMinX'))
				}
			}
	 	},

	 	_overHandler:function($o){
	 		var self = this
			var group = self.get('_groupArr')[$o.index]
			$o.cx = Number($o.cx) + Number(group.get('element').get('_x'))
			self.get('element').fire(EventType.OVER,$o)
		},
		_outHandler:function($o){
			var self = this
			self.get('element').fire(EventType.OUT,$o)
		}
	});

	return Graphs;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','./group','../../models/eventtype']
	}
);