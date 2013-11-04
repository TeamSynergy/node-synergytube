{% extends 'layout.swig' %}

{% block title %}Dash · SynergyTube{% endblock %}

{% block content %}
<a href="/u/auth/facebook">Login with Facebook</a><br>
<a href="/u/auth/google">Login with Google</a><br>

<form action="/u/auth/local" method="post">
<input type="text" name="email" placeholder="Email">
<input type="password" name="password" placeholder="Password">
<input type="submit">
</form>
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