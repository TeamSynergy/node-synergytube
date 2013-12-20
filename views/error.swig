{% extends 'layout.swig' %}

{% block title %}Error · SynergyTube{% endblock %}
{% block content %}

<h1>Error 500 - Internal Server Error :(</h1>
<h4>Additional Info:</h4>
<dl class="dl-horizontal alert alert-danger">
  <dt>Code (Wiki)</dt>
  <dd><a href="https://github.com/TeamSynergy/node-synergytube/wiki/err-EUNOTFOUND" target="_blank">EUNOTFOUND</a></dd>

  <dt>Message</dt>
  <dd>{{ error }}</dd>

  <dt>Possible Solutions</dt>
  <dd>You have to create a User in order to login.</dd>
</dl>

{% endblock %}
