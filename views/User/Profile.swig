{% extends '../layout.swig' %}

{% block title %}{{user.display_name}} · SynergyTube{% endblock %}
{% block head %}
  <!-- build:css /assets/css/profile.css -->
  <link rel="stylesheet" href="/assets/css/profile.css">
  <!-- endbuild -->
{% endblock %}

{% block content %}
<div class="row">
  <div class="col-md-3">
    <img src="{{user.avatar.url}}" id="useravatar" class="img-rounded">
    <h2>{{user.display_name}}</h2>

    <hr>

    <p><i class="fa fa-clock-o mhelp"></i> User since {{joindate}}.</p>

    <hr>

    <div id="stats">
      <p><span class="number">1</span><br><span class="desc">Own</span></p>
      <p><span class="number">9</span><br><span class="desc">Favs</span></p>
    </div>

  </div>


  <div class="col-md-9 row">
    <div class="col-md-6">
      <div class="panel panel-default">
        <div class="panel-heading">Users favourite Channels</div>
        <ul>
          <li>bla</li>
          <li>blub</li>
          <li>ranodm</li>
        </ul>
      </div>
    </div>
    <div class="col-md-6">
      <div class="panel panel-default">
        <div class="panel-heading">Users own Channels</div>
        <ul>
          <li>bla</li>
          <li>blub</li>
          <li>ranodm</li>
        </ul>
      </div>
    </div>

    </div>
  </div>
</div>
{% endblock %}
