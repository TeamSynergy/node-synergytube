{% extends '../layout.swig' %}

{% block title %}{{channel.name}} · SynergyTube{% endblock %}
{% block head %}<link rel="stylesheet" href="/assets/css/channel.css">{% endblock %}
{% block angularApp %}ChannelController{% endblock %}
{% block customdata %}data-shortstring="{{channel.short_string}}"{% endblock %}

{% block content %}




<div class="row" id="player-chat-row">

  <!-- Player -->
  <div class="col-md-6">
    <div id="player">Error :(</div>
  </div>


  <!-- Chat -->
  <div class="col-md-4">
    <div id="chat">
      <ul class="unstyled">
        <li ng-repeat="message in chat | orderBy:'timestamp'">
          <span ng-bind="message.content"></span>
        </li>
      </ul>
    </div>
  </div>


  <!-- Who's Online -->
  <div class="col-md-2">

  </div>
</div>


<!-- Media Controls -->
<div id="control-panel">
  <div id="controls">
    <span class="pull-left">
      <a href="" class="fa fa-heart-o"></a>
    </span>

    <span class="center">
      <a href="" class="fa fa-backward"></a>
      <a href="" class="fa fa-random"></a>
      <a href="" class="fa fa-forward"></a>
    </span>

    <span class="pull-right">
      <a href="" class="fa fa-plus"   ng-click="ui.inputAdd.toggle()"></a>
      <a href="" class="fa fa-search" ng-click="ui.inputSearch.toggle()"></a>
    </span>
  </div>

  <form id="input-add" class="form-horizontal animate-show-top" ng-show="ui.inputAdd.show">
    <div class="input-group">
      <span class="input-group-addon">Link:</span>
      <input type="url" class="form-control" id="inputAdd" ng-model="ui.inputAdd.text" placeholder="www.youtube.com/v/uN2X1MTwEIc">
      <span class="input-group-btn">
        <input type="submit" class="btn btn-primary" value="Add!" disabled>
      </span>
    </div>
  </form>

  <form id="input-search" class="form-horizontal animate-show-top" ng-show="ui.inputSearch.show">
    <input type="text" class="form-control" id="inputSearch" ng-model="ui.inputSearch.text" placeholder="kitten, funny, pony">
  </form>

</div>


<!-- Playlist -->
<table id="playlist" class="table">
  <tbody>
    <tr ng-repeat="item in playlist | filter:ui.inputSearch.text | orderBy:'position'">
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
<script src="/assets/vendor/angular-animate/angular-animate.min.js"></script>
<script src="/assets/vendor/xmbd/build/xmbd.min.js"></script>
<script src="/assets/js/controllers/channel.js"></script>
{% endblock %}
