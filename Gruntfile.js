module.exports = function(grunt){
	// Project configuration. 
	grunt.initConfig({
	  concat: {
	    options: {
	      separator: ';',
	    },
	    dist: {
	      src: ['simple_statistics.js', 'leaflet.geometiers.js'],
	      dest: 'dist/leaflet.geometiers.js',
	    },
	  },

	  uglify: {
	    dist: {
	      files: {
	        'dist/leaflet.geometiers.min.js': ['dist/leaflet.geometiers.js']
	      }
	    }
	   }

	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['concat','uglify']);
}