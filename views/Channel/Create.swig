{% extends '../layout.swig' %}

{% block title %}Create Channel · SynergyTube{% endblock %}
{% block head %}
  <!-- build:css /assets/css/create-channel.css -->
  <link rel="stylesheet" href="/assets/css/create-channel.css">
  <!-- endbuild -->
{% endblock %}
{% block angularApp %}ChannelCreateController{% endblock %}

{% block content %}
<div class="jumbotron">
  <h1>Create your own Channel!</h1>
  {% if !user.logged_in %}
  <p>Sorry, but you have to login/register first in order to create your own Channel.</p>
  {% else %}
  <p>You want to create your own Channel? Get in here! Just give us the informations we need, and leave the rest to us. Currently there is no ability to set Admins or other funny things, so you have to keep track of your channel for yourself. But anyways:</p>
  <p>Have fun and enjoy Synergytube!</p>
  {% endif %}
</div>

{% if user.logged_in %}
<form action="/c/create" method="post" enctype="multipart/form-data" class="form-horizontal" name="newChannel">

  <div class="form-group">
    <label for="title" class="col-sm-2 control-label">Title:</label>
    <div class="col-sm-10">
      <input class="form-control" id="title" type="text" name="title" placeholder="{{slug}}" ng-model="ui.title.text" ng-change="ui.title.change()">
    </div>
  </div>

  <div class="form-group">
    <label for="url" class="col-sm-2 control-label" ut-tooltip="This determines the url your channel will get. For example: synergytube.com/c/awesome-chanel-thingy" ut-tooltip-placement="top">Short String <i class="fa fa-info-circle"></i>:</label>
    <div class="col-sm-10 input-group">
      <input class="form-control" id="url" type="text" name="url" ng-model="ui.url.text" ng-change="ui.url.change()" placeholder="Short String">
      <span class="input-group-btn" ut-tooltip="Click here to replace the string to the left with a valid one from the right." ut-tooltip-placement="top">
        <a href="" class="btn btn-primary" ng-disabled="!ui.url.text || ui.url.text == ui.url.slugified" ng-click="ui.url.text = ui.url.slugified"><i class="fa fa-chevron-left"></i></a>
      </span>
      <input class="form-control" type="text" ng-value="ui.url.slugified" placeholder="Slugified String" disabled>
    </div>
  </div>


  <div class="form-group">
    <label for="description" class="col-sm-2 control-label">Description:</label>
    <div class="col-sm-10">
      <textarea class="form-control" rows="3" ng-model="ui.desc.text" name="description"></textarea>
    </div>
  </div>

  <div class="well">
    <input type="submit" value="Create!" class="btn btn-primary btn-lg pull-right" ng-disabled="!ui.valid()">
    <div class="clearfix"></div>
  </div>

  <ul class="alert alert-info" ng-show="!ui.valid()"><li ng-repeat="message in ui.messages" ng-bind="message"></li></ul>
</form>
{% endif %}

{% endblock %}

{% block js %}
<script src="/assets/vendor/angular/angular.min.js"></script>
<script src="/assets/vendor/underscore.string/dist/underscore.string.min.js"></script>
<script src="/assets/js/controllers/create-channel.js"></script>
<script src="/assets/js/directives/synergy.utils.js"></script>
{% endblock %}
