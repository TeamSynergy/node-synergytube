<!DOCTYPE html>
<html>
<head>
	<title>{% block title %}Template{% endblock %}</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1">
	
	<link rel="stylesheet" href="/assets/vendor/bootstrap/dist/css/bootstrap.min.css">
	<link rel="stylesheet" href="/assets/vendor/font-awesome/css/font-awesome.min.css">
	<link rel="stylesheet" href="/assets/css/main.css">
	{% block head %}{% endblock %}
</head>
<body>
	<div class="navbar navbar-default navbar-static-top">
		<div class="container">
			<div class="navbar-header">
				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<a class="navbar-brand" href="/">SynergyTube</a>
			</div>
			<div class="navbar-collapse collapse">
				<ul class="nav navbar-nav">
					<li class="active"><a href="#">Dash</a></li>
					<li><a href="#">Foo</a></li>
				</ul>
				<ul class="nav navbar-nav navbar-right">
					{% if logged_in %}
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-user"></i> {{display_name}} <b class="caret"></b></a>
						<ul class="dropdown-menu">
							<li><a href="/u/config"><i class="fa fa-fw fa-cog"></i> Account Settings</a></li>
							<li><a href="/u/auth/logout"><i class="fa fa-fw fa-cdog"></i> Log Out</a></li>
						</ul>
					</li>
					{% else %}
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown">Log In <b class="caret"></b></a>
						<form action="/u/auth/local" method="post" class="dropdown-menu dropdown-login">
							<h5>Connect with:</h5>
							<a href="/u/auth/facebook" class="btn form-control btn-facebook"><i class="fa fa-facebook"></i> Facebook</a>
							<a href="/u/auth/google" class="btn form-control btn-google"><i class="fa fa-google-plus"></i> Google</a>
							<hr>
							<h5>Login via Email:</h5>
							<input class="form-control" type="email" name="email" placeholder="Email">
							<input class="form-control" type="password" name="password" placeholder="Password">
							<input class="form-control btn-primary" type="submit" value="Login">
						</form>
					</li>
					{% endif %}
				</ul>
			</div>
		</div>
	</div>

	<div class="container">
		{% if flash %}
		<div class="alert alert-warning">{{ flash }}</div>
		{% endif %}
		{% block content %}{% endblock %}
	</div>
	
	<script src="/assets/vendor/jquery/jquery.min.js"></script>
	<script src="/assets/vendor/bootstrap/dist/js/bootstrap.min.js"></script>
	{% block js %}{% endblock %}
</body>
</html>