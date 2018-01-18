<template>
	<div class="image-croppa">
		<el-row class="croppa-panel">
			<el-col :span="11">
				<div class="box-title">裁剪框</div>
				<div class="center-block">
					<div class="croppa-wrapper-control" :style="{width:controlMaxWidth+'px',height:controlMaxHeight+'px'}">
						<croppa	ref="croppa"
								v-model="myCroppa"
								:width="width"
								:height="height"
								placeholder="点击或拖拽一张图片到这里"
								:zoom-speed="5"
								:quality="quality"         
								:prevent-white-space="true"
								@new-image-drawn="updatePreviewImage"
								@image-remove="imageRemove"
						></croppa>
					</div>
				</div>

			</el-col>
			<el-col class="update-view-control" :span="2">
				
			</el-col>
			<el-col :span="11">
				<div class="box-title">预览</div>
				<div class="center-block">
					<div class="croppa-wrapper-control" :style="{width:controlMaxWidth+'px',height:controlMaxHeight+'px'}">
						<div class="preview-image-box" :style="{width:width+'px',height:height+'px'}">
							<img :src="previewSrc" alt="预览图" width="100%" height="100%">
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		

		<div class="croppa-control-bar">
			<el-form>
				<el-col :span="4">
					<el-form-item label="常用尺寸" align="right" :label-width="labelWidth">
						<el-select v-model="currentSizeIndex">
							<el-option v-for="(size, index) in sizeList" :key="index" :label="size" :value="index"></el-option>
						</el-select>
					</el-form-item>
				</el-col>

				<el-col :span="7">
					<el-form-item v-show="currentSizeIndex===0" label="自定尺寸" :label-width="labelWidth">
						<el-col :span="10">
							<el-input type="number" v-model.number="customWidth"></el-input>
						</el-col>
						<el-col :span="4" align="center">x</el-col>
						<el-col :span="10">
							<el-input type="number" v-model.number="customHeight"></el-input>
						</el-col>
					</el-form-item>
				</el-col>
				
				<el-col :span="4">
					<el-form-item label="图片类型" :label-width="labelWidth">
						<el-select v-model="curMIMEtypeIndex" @change="updatePreviewImage">
							<el-option v-for="(type, index) in MIMEtypes" :key="index" :label="type" :value="index"></el-option>
						</el-select>
					</el-form-item>
				</el-col>

				<el-col :span="4">
					<el-form-item v-if="!curMIMEtypeIndex" label="压缩率" :label-width="labelWidth">
						<el-select v-model="curCompressionRateIndex" @change="updatePreviewImage">
							<el-option v-for="(rate, index) in compressionRates" :key="index" :label="rate" :value="index"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
	    		
	    		<el-col :span="5" align="center">
	    			
	    			<el-button type="primary" @click="cut" size="medium">裁剪并下载</el-button>

	    		</el-col>

			</el-form>
		</div>
		
	</div>

</template>

<script>
	/*
		该组件强制依赖于vue、Ement-ui、vue-croppa
		需在全局main.js注册croppa，步骤如下：
		
		import Croppa from 'vue-croppa'
		import 'vue-croppa/dist/vue-croppa.css'
		Vue.use(Croppa)
		
		
	 */
	export default {

		data(){
			return {
		        labelWidth: '80px',

				//裁剪框显示的最大宽高默认值
				controlMaxWidth: 400,
				controlMaxHeight: 400,

				myCroppa: {},


				//常用海报可选尺寸
				sizeList: ['自定义宽高','100x100', '130x240','260x480','300x300', '350x180','600x600','1280x210'],	
				//当前选中的尺寸索引值	
		        currentSizeIndex: 0,

		        //自定义宽高
		        customWidth: 300,
		        customHeight: 300,

		        //可生成的图片类型
		        MIMEtypes: ['image/jpeg', 'image/png'],	
		        //可选压缩率	
		        compressionRates: ['默认','0.9','0.8','0.7','0.6','0.5','0.4','0.3','0.2','0.1'],   
		        //当前选中的图片类型索引值
		        curMIMEtypeIndex: 0,
		        //当前选中的压缩率索引值
		        curCompressionRateIndex: 0,

		        //预览图路径
		        previewSrc: '',

		        generatingFlag: false,
			}
		},

		computed:{
			sizeInfo(){
				let selectedSizeText = this.sizeList[this.currentSizeIndex];

				if(selectedSizeText === '自定义宽高'){
					return [this.customWidth || 5, this.customHeight || 5];
				}else{

					return selectedSizeText.split("x");
				}
			},

			//所选生成尺寸宽度
			w(){
				return parseInt(this.sizeInfo[0], 10);
			},

			//所选生成尺寸高度
			h(){
				return parseInt(this.sizeInfo[1], 10);
			},

			//裁剪框大小 相对于 生成尺寸大小 的缩放度
			scale(){
				if(this.w <= this.controlMaxWidth && this.h <= this.controlMaxHeight){
					return 1;
				}else{
					//以较大的边为准
					if(this.w >= this.h){
						return this.controlMaxWidth / this.w;

					}else{
						return this.controlMaxHeight / this.h;
					}
				}
			},

			//裁剪框实际显示宽度
			width(){
				let tmp = this.w * this.scale;
				return tmp > this.controlMaxWidth ? this.controlMaxWidth : tmp;;
			},

			//裁剪框实际显示高度
			height(){
				let tmp = this.h * this.scale;
				return tmp > this.controlMaxHeight ? this.controlMaxHeight : tmp;;
			},

			//croppa的quality属性值，标识输出的图片尺寸大小相对于裁剪框大小的倍数
			//有如下计算关系：
			//		 outputWidth = width * quality,
			//		 outputHeight = height * quality
			quality(){
				return this.w / this.width;
			}
		},

		watch:{
			//监听myCroppa位置变化，实时更新预览图
			'myCroppa.imgData': {
				handler(){
					if(!this.generatingFlag){

						this.updatePreviewImage();
					}
				},	
				deep: true
			}
		},

		methods: {
			
			cut(){

				if(!this.previewSrc){
					
					this.$alert('请先选择一张图片进行裁剪！',{
						type: 'warning'
					});

				}else{
					this.generateImage();
				}
			},

			generateImage( callback ) {

				//测试发现，压缩率貌似只和jpg图片类型有关
				if(!this.curMIMEtypeIndex && this.curCompressionRateIndex){

					var compressionRate = parseFloat(this.compressionRates[this.curCompressionRateIndex]);
				}else{
					var compressionRate = 1;
				}

		    	this.myCroppa.generateBlob((blob) => {
		    	
            		if(typeof callback === "function"){
            			callback( blob );
            		}else{

            			this.$emit("generateImageBlob",blob);
            			this.myCroppa.remove()
            		}

		    	}, this.MIMEtypes[this.curMIMEtypeIndex],  compressionRate)

		    },


		    //更新预览图
		    updatePreviewImage(){
		    	this.generatingFlag = true;

		    	this.generateImage((blob)=>{
		    		this.generatingFlag = false;

		    		if(blob){
			    		var url = URL.createObjectURL(blob)
			    		this.previewSrc = url;
		    		}
		    	});
		    },

		    imageRemove(){
		    	this.previewSrc = '';
		    }

		},
	}
</script>

<style>

	.image-croppa{
		min-width: 1200px;
	}
	.image-croppa .croppa-wrapper-control,
	.image-croppa .update-view-control{
		text-align: center;
		display: table-cell;
		vertical-align: middle;
		line-height: 0;
	}
	.image-croppa .update-view-control{
		height: 100%;
	}
	.croppa-panel .el-col{
		position: relative;
		text-align: center;
	}
	.croppa-panel .center-block{
		display: inline-block;
	}
	.image-croppa .box-title{
		width: 100%;
		position: absolute;
		top: -30px;
		text-align: center;
	}
	.image-croppa .preview-image-box{
		display: inline-block;
		transition: all 0.3s;
	    position: relative;
	    font-size: 0;
	    -ms-flex-item-align: start;
	    align-self: flex-start;
	    background-color: #e6e6e6;
	}
	.image-croppa .croppa-control-bar{
		clear: left;
		margin-top: 10px;
		text-align: center;
	}
	.image-croppa canvas{
		display: block;
	}
	.image-croppa .el-form-item{
		margin-bottom: 0;
	}
</style>