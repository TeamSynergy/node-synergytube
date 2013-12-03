{% extends '../layout.swig' %}

{% block title %}{{channel.name}} · SynergyTube{% endblock %}
{% block head %}<link rel="stylesheet" href="/assets/css/channel.css">{% endblock %}
{% block angularApp %}ChannelController{% endblock %}
{% block customdata %}
data-shortstring="{{channel.short_string}}"
data-user='{{JSON.stringify(user)}}'
{% endblock %}

{% block content %}




<div class="row" id="player-chat-row">

  <!-- Player -->
  <div class="col-md-6">
    <div id="player" ut-xmbd="mc.current" ut-xmbd-next="mc.nextFn"><span class="error">Error :(</span></div>
  </div>


  <!-- Chat -->
  <div class="col-md-6 row" id="chat-user-row" ng-class="{ hideChat: !me.logged_in }">
    <div class="col-md-8">
      <ul id="chat" class="list-unstyled">
        <li ng-repeat="message in chat track by $index | orderBy:'timestamp'">
          <img ng-src="#{message._user.avatar.url}#" ut-tooltip="#{message._user.display_name}#" class="img-circle">
          <div class="bubble">
            <p ng-bind-html="message.content | linky:'_blank'"></p>
            <time am-time-ago="message.timestamp" title="#{message.timestamp | amCalendar }#" class="pull-right"></time>
          </div>
        </li>
      </ul>

      <form class="input-group" ng-submit="ui.inputMessage.submit()" ng-show="me.logged_in">
        <input type="text" class="form-control" id="chatInput" ng-model="ui.inputMessage.text">
        <span class="input-group-btn">
          <a href="" class="btn btn-primary" ng-disabled="!ui.inputMessage.text"><i class="fa fa-chevron-right"></i></a>
        </span>
      </form>
    </div>


    <!-- Who's Online -->
    <div class="col-md-4">
      <ul id="online" class="list-unstyled">
        <li ng-repeat="user in users track by $index | orderBy:'name'">
          <a ng-href="/u/#{user._id}#">
            <div>
              <img ng-src="#{user.avatar}#" class="img-circle">
              <p ng-bind="user.name"></p>
            </div>
          </a>
        </li>
      </ul>
    </div>
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
<script src="/assets/vendor/moment/min/moment.min.js"></script>
<script src="/assets/vendor/angular/angular.min.js"></script>
<script src="/assets/vendor/angular-animate/angular-animate.min.js"></script>
<script src="/assets/vendor/angular-sanitize/angular-sanitize.min.js"></script>
<script src="/assets/vendor/angular-moment/angular-moment.min.js"></script>
<script src="/assets/vendor/swfobject/swfobject/swfobject.js"></script>
<script src="/assets/js/xmbd/src/xmbd.js"></script>
<script src="/assets/js/directives/synergy.utils.js"></script>
<script src="/assets/js/controllers/channel.js"></script>
{% endblock %}
