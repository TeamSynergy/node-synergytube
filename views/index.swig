{% extends 'layout.swig' %}

{% block title %}Dash · SynergyTube{% endblock %}

{% block content %}

{% for channel in channels %}
<div class="channel-preview">
  <img src="{{channel.current_thumbnail}}">
  <a href="/c/{{channel.short_string}}"><h3>{{channel.name}}</h3></a>
</div>
{% endfor %}

{% endblock %}
