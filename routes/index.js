/**
 * Created by sergiovilar on 14/05/14.
 */

var YoutrackGitlab  = require('../src/youtrack-gitlab.js');

exports.index = function(req, res){

	var yt = new YoutrackGitlab({

		searchOn: 'branch', // may be commit too

		auth: {
			url: 'http://YOUTRACK_URL/rest/',
			login: 'YOUTRACK_USERNAME',
			password: 'YOUTRACK_PASSWORD'
		},

		rules: [

			{
				type: 'Bug',
				states: [
					{begin: 'Submitted', final: 'Fixed'},
					{begin: 'Opened', final: 'Fixed'},
					{begin: 'In progress', final: 'Fixed'}
				]
			},

			{
				type: 'Task',
				states: [
					{begin: 'In progress', final: 'To verify'}					
				]
			}

		]

	});

	yt.track(req);

	res.send(true);

};