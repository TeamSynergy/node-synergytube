{% extends 'layout.swig' %}

{% block title %}Dash · SynergyTube{% endblock %}
{% block head %}
  <!-- build:css /assets/css/index.css -->
  <link rel="stylesheet" href="/assets/css/index.css">
  <!-- endbuild -->
{% endblock %}
{% block content %}

<div class="jumbotron">
  <h1>Hello, Synergytube!</h1>
  <p>This is your ultimate sharing place for your newest kitten-videos, your favourite Song or just another Let's Play. Synergytube allows you to create up to 2 own Channels where you can watch videos, livestreams or listen to Music with your friends, strangers or simply everyone. The media will be synced between everyone in the Channel, so everyone gets the same as you do!</p>
  <p><a class="btn btn-primary btn-lg" href="#">Learn more!</a></p>
</div>

<h2>Browse Synergytube for interesting Channels:</h2>
<hr>

<ul class="list-unstyled" id="channels">
  {% for channel in channels %}
  <li class="prev">
    <div class="thumb">
      <img src="{{channel.current_thumbnail}}">
    </div>
    <a href="/c/{{channel.short_string}}"><h3>{{channel.name}}</h3></a>
  </li>
  {% endfor %}
<ul>

{% endblock %}
