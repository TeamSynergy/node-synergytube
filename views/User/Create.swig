{% extends '../layout.swig' %}

{% block title %}Create User · SynergyTube{% endblock %}
{% block angularApp %}UserCreateController{% endblock %}

{% block content %}
<div class="jumbotron">
	<h1>Register a User now!</h1>
	<p>In order to enjoy all features of SynergyTube (like Chat, Favourites, etc) You first have to create a User.<br>
	You can either Log In via Facebook, Google or simply Email and Password. You also have the ability to set a password later
	if you decide to log in with Facebook or Google now. Also you can use these methods interchangeable and won't be bound to one.</p>
	<p>Your passwords are safe at SynergyTube.</p>
	<p>Pssh: we won't collect any other information from your account than your name and your email!</p>
</div>

<form action="" method="post" class="form-horizontal well" name="newUser" autocomplete="off">
	{% if ext.show_local %}
	<div class="form-group">
		<label for="inputEmail" class="col-sm-2 control-label">Email</label>
		<div class="col-sm-10">
			<input class="form-control input-l" id="inputEmail" type="text" name="email" ng-model="ui.email" placeholder="Email" ng-change="ui.emailChange()" required>
		</div>
	</div>
	<div class="form-group">
		<label for="inputDisplayname" class="col-sm-2 control-label">Displayname</label>
		<div class="col-sm-10">
			<input class="form-control" id="inputDisplayname" type="text" name="displayname" ng-model="ui.displayname" ng-change="ui.manualDisplayname = true" placeholder="Displayname" required>
		</div>
	</div>
	<div class="form-group">
		<label for="inputPassword" class="col-sm-2 control-label">Password</label>
		<div class="col-sm-10">
			<input class="form-control" id="inputPassword" type="password" name="password" ng-model="ui.password" placeholder="Password" required>
		</div>
	</div>
	<div class="form-group">
		<div class="col-sm-2"></div>
		<div class="col-sm-10">
			<input class="form-control" type="password" ng-model="ui.passwordRepeat" placeholder="Repeat it!" required>
		</div>
	</div>
	{% endif %}

	{% if ext.show_facebook %}
	<a href="/u/auth/facebook" class="btn btn-facebook btn-lg"><i class="fa fa-facebook fa-lg"></i> Facebook</a>
	{% endif %}
	{% if ext.show_google %}
	<a href="/u/auth/google" class="btn btn-google btn-lg"><i class="fa fa-google-plus fa-lg"></i> Google</a>
	{% endif %}
	{% if ext.show_local %}
	<input type="submit" value="Register!" class="btn btn-primary btn-lg pull-right" ng-disabled="!ui.valid()">
	<div class="clearfix"></div>
	{% endif %}
	{% if !ext.show_local && !ext.show_facebook && !ext.show_google %}
	<h3>There is currently no available Option to register. Try again later. If this Problem persists, contact an Admin.</h3>
	{% endif %}
</form>

{% if ext.show_local %}
<ul class="alert alert-info" ng-show="!ui.valid()"><li ng-repeat="message in ui.messages" ng-bind="message"></li></ul>
{% endif %}

{% endblock %}

{% block js %}
{% if ext.show_local %}
<script src="/assets/vendor/angular/angular.min.js"></script>
<script src="/assets/js/controllers/create-user.js"></script>
{% endif %}
{% endblock %}
