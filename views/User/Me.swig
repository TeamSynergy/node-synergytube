{% extends '../layout.swig' %}

{% block title %}My Profile · SynergyTube{% endblock %}

{% block content %}
<form action="/u/set" method="post" class="form-horizontal well" ng-submit="submit()" name="newUser">
  <div class="form-group">
    <label for="inputEmail" class="col-sm-2 control-label">Email</label>
    <div class="col-sm-10">
      <input class="form-control input-l" id="inputEmail" value="{{ user.email }}" disabled>
    </div>
  </div>
  <div class="form-group">
    <label for="inputDisplayname" class="col-sm-2 control-label">Displayname</label>
    <div class="col-sm-10">
      <input class="form-control" id="inputDisplayname" type="text" name="displayname" ng-model="displayname" placeholder="Displayname" value="{{ user.display_name }}" required>
    </div>
  </div>
  {% if user.has_local %}
  <h3>You have a password. You can change it here:</h3>
  {% else %}
  <h3>You currently have no local password. Set it here:</h3>
  {% endif %}
  <div class="form-group">
    <label for="inputPassword" class="col-sm-2 control-label">Set a Password</label>
    <div class="col-sm-10">
      <input class="form-control" id="inputPassword" type="password" name="password" ng-model="password" placeholder="Password">
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-2"></div>
    <div class="col-sm-10">
      <input class="form-control" type="password" ng-model="passwordRepeat" placeholder="Repeat it!">
    </div>
  </div>

  <input type="submit" value="Change" class="btn btn-primary btn-lg pull-right">
  <div class="clearfix"></div>
</form>

{% endblock %}
