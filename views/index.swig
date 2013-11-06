{% extends 'layout.swig' %}

{% block title %}Dash · SynergyTube{% endblock %}

{% block content %}
<a href="#" rel="tooltip" title="first tooltip">hover over me</a>
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