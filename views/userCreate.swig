{% extends 'layout.swig' %}

{% block title %}Create User · SynergyTube{% endblock %}
{% block angularApp %}ng-controller="ValidateCtrl"{% endblock %}

{% block content %}
<div class="jumbotron">
	<h1>Register a User now!</h1>
	<p>In order to enjoy all features of SynergyTube (like Chat, Favourites, etc) You first have to create a User.<br>
	You can either Log In via Facebook, Google or simply Email and Password. You also have the ability to set a password later
	if you decide to log in with Facebook or Google now. Also you can use these methods interchangeable and won't be bound to one.</p>
	<p>Pssh: we won't collect any other information from your account than your name and your email!</p>
</div>

<form action="/u/create/local" method="post" class="form-horizontal well" ng-submit="submit()" name="newUser">
	<div class="form-group">
		<label for="inputEmail" class="col-sm-2 control-label">Email</label>
		<div class="col-sm-10">
			<input class="form-control input-l" id="inputEmail" type="email" name="email" ng-model="email" placeholder="Email" required>
		</div>
	</div>
	<div class="form-group">
		<label for="inputDisplayname" class="col-sm-2 control-label">Displayname</label>
		<div class="col-sm-10">
			<input class="form-control" id="inputDisplayname" type="text" name="displayname" ng-model="displayname" placeholder="Displayname" required>
		</div>
	</div>
	<div class="form-group">
		<label for="inputPassword" class="col-sm-2 control-label">Password</label>
		<div class="col-sm-10">
			<input class="form-control" id="inputPassword" type="password" name="password" ng-model="password" placeholder="Password" required>
		</div>
	</div>
	<div class="form-group">
		<div class="col-sm-2"></div>
		<div class="col-sm-10">
			<input class="form-control" type="password" ng-model="passwordRepeat" placeholder="Repeat it!" required>
		</div>
	</div>

	<a href="/u/create/facebook" class="btn btn-facebook btn-lg"><i class="fa fa-facebook fa-lg"></i> Facebook</a>
	<a href="/u/create/google" class="btn btn-google btn-lg"><i class="fa fa-google-plus fa-lg"></i> Google</a>
	<input type="submit" value="Register!" class="btn btn-primary btn-lg pull-right">
</form>

{% endblock %}

{% block js %}
<script src="/assets/vendor/angular/angular.min.js"></script>
<script src="/assets/js/controllers/userCreateController.js"></script>
{% endblock %}