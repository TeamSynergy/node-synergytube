<!DOCTYPE html>
<html>
<head>
	<title>{% block title %}Template{% endblock %}</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1">
	
	<link rel="stylesheet" href="/assets/vendor/bootstrap/dist/css/bootstrap.min.css">
	<link rel="stylesheet" href="/assets/vendor/font-awesome/css/font-awesome.min.css">
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
						<a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-user"></i> User <b class="caret"></b></a>
						<ul class="dropdown-menu">
							<li><a href="#">Logout</a></li>
							<li><a href="#">Dunno</a></li>
						</ul>
					</li>
					{% endif %}
				</ul>
			</div>
		</div>
	</div>

	{% if flash %}
	<div class="alert alert-warning">{{ flash }}</div>
	{% endif %}

	<div class="container">
		{% block content %}{% endblock %}
	</div>
	
	<script src="/assets/vendor/jquery/jquery.min.js"></script>
	<script src="/assets/vendor/bootstrap/dist/js/bootstrap.min.js"></script>
	{% block js %}{% endblock %}
</body>
</html>