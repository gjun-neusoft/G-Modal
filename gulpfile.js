/*
 * gulp + webpack3 多应用构建配置
 * 命令加 -p 参数，开启压缩模式，如 gulp test -p
 * 命令加 -c 参数，删除构建目标目录
 * 命令加 -h 参数，hash文件输出
 * 命令加 -o 参数，单次构建模式，不进行挂起监听操作
 * aiv367 2017-06-30
 */
var gulp = require("gulp");
var webpack = require("webpack");
var colors = require('colors');
var path = require('path');
var del = require('del');
var minimist = require('minimist');//从命令行传递参数
var extractTextPlugin  = require("extract-text-webpack-plugin");
var WebpackMd5Hash = require('webpack-md5-hash');
var AssetsPlugin = require('assets-webpack-plugin');
var minifyHtml = require("gulp-minify-html");
var rev = require('gulp-rev-hash');
var watch = require('gulp-watch');

//获取命令参数
var cmdParams = minimist(process.argv.slice(2));

/* 任务部分 开始 ---------------------------------------------------------------------------------------------- */
//PC端
gulp.task('default',['pc']);

gulp.task('pc', function (){

	var isWatch = !cmdParams.o;
	var isWatching = false;

	var options = {
		entry : {
			'gui'   : './src/scripts/g-ui.js'					//主切换结构页面
		},
		dist : path.join(__dirname,'./dist'),
		publicPath: './',//url-loader 替换的url,相对于模板的地址引用关系
		allInOne : false,
		hasCommon : true,
		watch : isWatch,
		onBuildSuccess : function(){

			//清理终止
			if(cmdParams.c) return false;

			//对.html进行压缩，资源文件加版本号
			function buildhtml(){
				gulp
				.src('./src/pc/views/*.html')
				.pipe(rev())
				.pipe(minifyHtml())
				.pipe(gulp.dest('.'));
				beep(1);
			}

			if(isWatch){

				if(!isWatching){
					watch([options.dist+'/*.css',options.dist+'/*.js','./src/pc/views/*.html'], function () {
						buildhtml();
					});

					buildhtml();
				}

				isWatching = true;

			}else{
				buildhtml();
			}

		}
	};

	webpackTask(options);

});


/* 任务部分 结束 ---------------------------------------------------------------------------------------------- */


//webpack任务方法
function webpackTask(options){

	//清除构建目录
	if(cmdParams.c){
		del(options.dist);
		del(path.join(__dirname,'./webpack-assets.json'));
		return false;
	}

	//构建输出文件名
	var buildCounter = 0;

	//输出文件名
	var outputBaseName = cmdParams.h ? '[name].[chunkhash:8]' : '[name]';

	var output = {
		filename: outputBaseName + '.js',
		chunkFilename: outputBaseName+".chunk.js",//给require.ensure用
		path : options.dist,
		publicPath: options.publicPath,//用于url-loader 生成的文件资源加入目录前缀
	}

	//loader
	if(options.allInOne){
		var module = {
			rules: [

				{test : /\.js$/, use : [{loader: 'babel-loader',options: { presets: ['es2015'] }}]},
				{test : /\.css$/, use : ['style-loader','css-loader']},
				{test : /\.scss$/, use : ['style-loader','css-loader','sass-loader']},
				{test : /\.less$/, use : ['style-loader','css-loader','less-loader']},
				{test : /\.json$/, use : ['json-loader']},
				{test : /\.(jpe?g|png|gif)$/, use: ['url-loader?limit=8192']},
				{test : /\.woff(2)?(\?.+)?$/, use: ['url-loader?limit=10000&minetype=application/font-woff']},
				{test : /\.(ttf|eot|svg)(\?.+)?$/, use: ['file-loader']},
				{test : /\.vue$/, use : ['vue-loader']},

			],
		};

	}else{
		var module = {
			rules: [

				{test : /\.js$/, use : [{loader: 'babel-loader',options: { presets: ['es2015'] }}]},
				{test : /\.css$/, use : extractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader','autoprefixer-loader']})},
				{test : /\.scss$/, use : extractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader','autoprefixer-loader','sass-loader']})},
				{test : /\.less$/, use : extractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader','autoprefixer-loader','less-loader']})},
				{test : /\.json$/, use : ['json-loader']},
				{test : /\.(jpe?g|png|gif)$/, use: ['url-loader?limit=8192']},
				{test : /\.woff(2)?(\?.+)?$/, use: ['url-loader?limit=10000&minetype=application/font-woff']},
				{test : /\.(ttf|eot|svg)(\?.+)?$/, use: ['file-loader']},
				{test : /\.vue$/, use : ['vue-loader']},
				{test: require.resolve('snapsvg'), use: 'imports-loader?this=>window,fix=>module.exports=0'}

			],
		}

		
	}

	//plugins
	if(options.allInOne){

		var plugin = [
			new webpack.ProvidePlugin({$ : 'jquery', jQuery : 'jquery', 'window.jQuery': 'jquery'}),
			new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'} }),
			cmdParams.p ? new webpack.optimize.UglifyJsPlugin({compress : {warnings: false } }):function(){},
		];

	}else{

		var plugin = [
			// new webpack.optimize.CommonsChunkPlugin({name : 'common'}),
			new extractTextPlugin( outputBaseName + ".css"),
			new webpack.ProvidePlugin({$ : 'jquery', jQuery : 'jquery', 'window.jQuery': 'jquery'}),
			new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'} }),
			cmdParams.h ? new WebpackMd5Hash():function(){},
			cmdParams.h ? new AssetsPlugin():function(){},
			cmdParams.p ? new webpack.optimize.UglifyJsPlugin({compress : {warnings: false } }):function(){},
		];

		//在前面
		options.hasCommon && plugin.unshift(new webpack.optimize.CommonsChunkPlugin({name : 'common'}));

	}

	webpack({

		entry: options.entry,
		output: output,
		module: module,
		plugins: plugin,

		resolve: {
			alias: {
				'vue': 'vue/dist/vue.js',
	  			'vuex': 'vue/dist/vuex.js',
				'jquery': 'jquery/dist/jquery.js',
			}
		},

		// devtool: "source-map",
		watch : options.watch

	}, function(err, stats) {

		//编译信息输出配置文件
		var outputOptions = {
			colors : {},
			cached: false,
			cachedAssets: false,
			children : false,
			modules: false,//true 是否显示模块信息
			chunks: false,
			reasons: false,
			errorDetails: false,
			chunkOrigins: false,
			hash : false,
			version :false,
			time : false,
			exclude: [ 'node_modules', 'bower_components', 'jam', 'components' ]
		};

		if(cmdParams.p){
			console.log(('\n【压缩构建 (' + (++buildCounter) +')】                                     构建时间：'+((stats.endTime - stats.startTime)/1000).toString()+'秒 \n').white.bgRed);
		}else{
			console.log(('\n【快速构建 (' + (++buildCounter) +')】                                     构建时间：'+((stats.endTime - stats.startTime)/1000).toString()+'秒 \n').white.bgGreen);
		}

		console.log(stats.toString(outputOptions));
		console.log('输出目录：'.grey + stats.compilation.compiler.outputPath);

		//编译声音提示
		stats.compilation.errors.length?beep(3):beep(1);

		err===null && options.onBuildSuccess && options.onBuildSuccess();

	});

}

//哔哔哔
function beep(n){
	for(var i =0;i<n;i++)
	{
		setTimeout(function(){
			process.stdout.write('\x07');
		},i*200);
	}
}