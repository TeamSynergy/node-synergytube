{% extends '../layout.swig' %}

{% block title %}{{channel.name}} · SynergyTube{% endblock %}
{% block angularApp %}ChannelController{% endblock %}
{% block customdata %}data-shortstring="{{channel.short_string}}"{% endblock %}

{% block content %}
<div class="row">
  <div class="col-md-6">
    <div id="player">
  </div>
  <div class="col-md-4">

  </div>
  <div class="col-md-2">

  </div>
</div>
<div id="controls">

</div>
<table id="playlist">
  <tbody>
    <tr ng-repeat="item in playlist | orderBy:'position'">
      <td ng-bind="pad(item.position) + '.'"></td>
      <td ng-bind="item.name"></td>
      <td ng-bind="getDuration(item.duration)"></td>
    </tr>
  </tbody>
</table>
{% endblock %}

{% block js %}
<script src="/socket.io/socket.io.js"></script>
<script src="/assets/vendor/jquery/jquery.min.js"></script>
<script src="/assets/vendor/angular/angular.min.js"></script>
<script src="/assets/vendor/xmbd/build/xmbd.min.js"></script>
<script src="/assets/js/controllers/channel.js"></script>
{% endblock %}
