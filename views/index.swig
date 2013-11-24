{% extends 'layout.swig' %}

{% block title %}Dash · SynergyTube{% endblock %}

{% block content %}
{% for channel in channels %}
<div class="channel-preview">
  <a href="/c/{{channel.short_string}}"><h3>{{channel.name}}</h3></a>
</div>
{% endfor %}

{% endblock %}

{% block js %}
<script src="/socket.io/socket.io.js"></script>
<script>
var socket = io.connect('http://localhost');
socket.on('message', function(data){
	console.log(data);
});
</script>
{% endblock %}
