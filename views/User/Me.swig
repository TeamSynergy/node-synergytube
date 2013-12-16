{% extends '../layout.swig' %}

{% block title %}My Profile · SynergyTube{% endblock %}
{% block head %}
  <!-- build:css /assets/css/my-profile.css -->
  <link rel="stylesheet" href="/assets/css/my-profile.css">
  <!-- endbuild -->
{% endblock %}
{% block angularApp %}MyProfileController{% endblock %}
{% block customdata %}
  data-fbid="{{user.profiles.facebook}}"
  data-ggid="{{user.profiles.google}}"
  data-gravatar="{{user.profiles.gravatar}}"
  data-default="{{user.avatar.default}}"
  data-current-url="{{user.avatar.url}}"
  data-current-provider="{{user.avatar.provider}}"
  data-ui-email="{{user.email}}"
  data-ui-displayname="{{user.display_name}}"
{% endblock %}

{% block content %}
<form action="/u/set" method="post" enctype="multipart/form-data" class="form-horizontal well" name="_ui">
  <h1>Welcome, {{user.display_name}}!</h1>

  <div class="form-group">
    <label for="inputEmail" class="col-sm-2 control-label">Email</label>
    <div class="col-sm-10">
      <input class="form-control input-l" id="inputEmail" ng-model="ui.email" disabled>
    </div>
  </div>
  <div class="form-group">
    <label for="inputDisplayname" class="col-sm-2 control-label">Displayname</label>
    <div class="col-sm-10">
      <input class="form-control" id="inputDisplayname" type="text" name="displayname" placeholder="Displayname" ng-model="ui.displayname" autocomplete="off" required>
    </div>
  </div>

  {% if user.has_local %}
  <h3>You have a password. If you want, you can change it here:</h3>
  {% else %}
  <h3>You currently have no local password. Set it here:</h3>
  {% endif %}
  <div class="form-group">
    <label for="inputPassword" class="col-sm-2 control-label">Set a Password</label>
    <div class="col-sm-10">
      <input class="form-control" id="inputPassword" type="password" name="password" ng-model="ui.password" placeholder="Password">
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-2"></div>
    <div class="col-sm-10">
      <input class="form-control" type="password" ng-model="ui.passwordRepeat" placeholder="Repeat it!">
    </div>
  </div>

  <hr>
  <h3>Change your Avatar here:</h3>
  <div class="row">
    <div class="col-sm-2">
      <img ng-src="#{avatar.url()}#" class="img-rounded" id="avatar">
      <a href="" class="btn btn-default select-file" ng-click="clickUpload()" ng-disabled="avatar.radio !== 'upload'">Select a File...</a>
    </div>

    <div class="col-sm-10" id="optsAvatar">
      <input type="text" class="form-control" ng-model="ui.username" placeholder="Username on Twitter, won't be saved" ng-disabled="avatar.radio !== 'twitter'" name="twitteruser">

      <div class="radio">
        <label><input type="radio" name="optAvatar" id="optAvatarFacebook" value="facebook" ng-model="avatar.radio" ng-disabled="!avatar.fbid">Avatar from Facebook</label>
      </div>
      <div class="radio">
        <label><input type="radio" name="optAvatar" id="optAvatarGoogle" value="google" ng-model="avatar.radio" disabled>Avatar from Google</label>
      </div>
      <div class="radio">
        <label><input type="radio" name="optAvatar" id="optAvatarGravatar" value="gravatar" ng-model="avatar.radio">Avatar from Gravatar</label>
      </div>
      <div class="radio">
        <label><input type="radio" name="optAvatar" id="optAvatarTwitter" value="twitter" ng-model="avatar.radio">Avatar from Twitter (fill in the textfield above)</label>
      </div>
      <div class="radio">
        <label><input type="radio" name="optAvatar" id="optAvatarDefault" value="default" ng-model="avatar.radio">Default Avatar</label>
      </div>
      <div class="radio">
        <label><input type="radio" name="optAvatar" id="optAvatarUpload" value="upload" ng-model="avatar.radio">Upload Avatar</label>
        <input type="file" accept="image/*" style="display:none" id="avatarupload" onchange="angular.element(this).scope().fileSelected(this)" name="avatar_image">
      </div>
    </div>
  </div>


  <input type="submit" value="Change" class="btn btn-primary btn-lg pull-right" ng-disabled="!ui.valid()">
  <div class="clearfix"></div>

</form>
<ul class="alert alert-info" ng-show="!ui.valid()"><li ng-repeat="message in ui.messages" ng-bind="message"></li></ul>

{% endblock %}

{% block js %}
<script src="/assets/vendor/angular/angular.min.js"></script>
<!-- build:js /assets/js/controllers/my-profile.js -->
<script src="/assets/js/controllers/my-profile.js"></script>
<!-- endbuild -->
{% endblock %}
