{% extends '../layout.swig' %}

{% block title %}{{channel.name}} · SynergyTube{% endblock %}
{% block head %}
  <!-- build:css /assets/css/channel.css -->
  <link rel="stylesheet" href="/assets/css/channel.css">
  <!-- endbuild -->
{% endblock %}
{% block angularApp %}ChannelController{% endblock %}
{% block customdata %}
data-shortstring="{{channel.short_string}}"
data-user='{{JSON.stringify(user)}}'
{% endblock %}

{% block content %}




<div class="row" id="player-chat-row">

  <!-- Player -->
  <div class="col-md-6">
    <div id="player" ut-xmbd="mc.current" ut-xmbd-next="mc.nextFn" ut-plst-length="playlist.length"><span class="error">Error :(</span></div>
  </div>


  <!-- Chat -->
  <div class="col-md-6 row" id="chat-user-row" ng-class="{ hideChat: !me.logged_in }">
    <div class="col-md-8">

      <ul id="chat" class="list-unstyled" ut-scroll-top="cc.more">
        <li class="loadmore" ng-show="cc.loading && !cc.allLoaded"><i class="fa fa-cog fa-spin"></i> Loading...</li>
        <li ng-repeat="message in chat | orderBy:'timestamp'">
          <img ng-src="#{message._user.avatar.url}#" ut-tooltip="#{message._user.display_name}#" ut-tooltip-placement="left" class="img-circle">
          <div class="bubble">
            <p ng-bind-html="message.content | linky:'_blank'"></p>
            <time am-time-ago="message.timestamp" title="#{message.timestamp | amCalendar }#" class="pull-right"></time>
          </div>
        </li>
      </ul>

      <!-- New Message -->
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

        <!-- Actual Users -->
        <li ng-repeat="user in users | orderBy:'name'">
          <a ng-href="/u/#{user._id}#">
            <div>
              <img ng-src="#{user.avatar}#" class="img-circle">
              <p ng-bind="user.name"></p>
            </div>
          </a>
        </li>

        <!-- Guests -->
        <li ng-show="guests > 0">
          <img src="{{default_avatar}}" class="img-circle">
          <p ng-pluralize count="guests" when="{'one': 'One Guest', 'other': '#{guests}# Guests'}"></p>
        </li>


      </ul>
    </div>
  </div>
</div>


<!-- Media Controls -->
<div id="control-panel">
  <div id="controls">

    <span class="pull-left">
      <a href="" class="fa fa-fw fa-heart-o" ng-show="me.logged_in" ut-tooltip="Like this channel"></a>
    </span>

    <span class="center">
      <a href="" class="fa fw-fw fa-backward" ng-click="mc.forcePlay(mc.getPrevious())" ng-show="me.admin || me.owner" ut-tooltip="Play previous"></a>
      <a href="" class="fa fw-fw fa-random"   ng-click="mc.forcePlay(mc.getRandom())"   ng-show="me.admin || me.owner" ut-tooltip="Play random Item"></a>
      <a href="" class="fa fa-fw fa-forward"  ng-click="mc.forcePlay(mc.getNext())"     ng-show="me.admin || me.owner" ut-tooltip="Play next"></a>
    </span>

    <span class="pull-right">
      <a href="" class="fa fa-fw fa-plus"   ng-click="ui.inputAdd.toggle()" ng-show="me.admin || me.owner" ut-tooltip="Add new item"></a>
      <a href="" class="fa fa-fw fa-search" ng-click="ui.inputSearch.toggle()" ut-tooltip="Search for item"></a>
    </span>

    <div class="clearfix"></div>
  </div>

  <!-- Add a new item -->
  <form id="input-add" class="form-horizontal animate-show-top" ng-show="ui.inputAdd.show" ng-submit="ui.inputAdd.submit()">
    <div class="input-group">
      <span class="input-group-addon">Link:</span>
      <input type="text" class="form-control" id="inputAdd" ng-model="ui.inputAdd.text" placeholder="www.youtube.com/v/uN2X1MTwEIc" ng-change="ui.inputAdd.change()">
      <span class="input-group-addon animate-show-right" ng-show="ui.inputAdd.working"><i class="fa fa-cog fa-spin"></i></span>
      <span class="input-group-btn">
        <input type="submit" class="btn btn-primary" value="Add!" ng-disabled="!ui.inputAdd.currentItem">
      </span>
    </div>
    <div class="info animate-show-top" ng-show="ui.inputAdd.currentItem" ng-class="{'success':ui.inputAdd.currentItem && !ui.inputAdd.warning, 'warning': ui.inputAdd.warning}">
      <span class="success" ng-show="ui.inputAdd.currentItem && !ui.inputAdd.warning"><i class="fa fa-check"></i></span>
      <span class="warning" ng-show="ui.inputAdd.warning"><i class="fa fa-warning"></i> <span ng-bind="ui.inputAdd.warning"></span></span>
      <span class="name">
        <i class="fa" ng-class="{'fa-youtube-play': ui.inputAdd.currentItem.provider == 'youtube',
                                 'fa-vimeo-square': ui.inputAdd.currentItem.provider == 'vimeo'}"></i>
        <span ng-bind="ui.inputAdd.currentItem.name"></span>
      </span>
      <span class="duration"><i class="fa fa-clock-o"></i> <span ng-bind="ui.inputAdd.currentItem.duration | duration"></span></span>
      <div class="clearfix"></div>
    </div>
  </form>

  <!-- Search Item -->
  <form id="input-search" class="form-horizontal animate-show-top" ng-show="ui.inputSearch.show">
    <input type="text" class="form-control" id="inputSearch" ng-model="ui.inputSearch.text" placeholder="kitten, funny, pony">
  </form>

</div>



<!-- Playlist -->
<table id="playlist" class="table">
  <tbody ui-sortable="mc.plstSort" ng-model="playlist">
    <tr ng-repeat="item in playlist | filter:ui.inputSearch.text | orderBy:'position'" ng-class="{ active: item._id == mc.current._id, selectable: (me.owner || me.admin) && item._id != mc.current._id }">
      <td ng-click="mc.forcePlay(this.item, true)" ng-bind="item.position | pad:2:'.'"></td>
      <td ng-click="mc.forcePlay(this.item, true)" ng-bind="item.name"></td>
      <td ng-click="mc.forcePlay(this.item, true)" ng-bind="item.duration | duration"></td>
      <td ng-click="mc.remove(item)" class="remove" ng-show="me.owner || me.admin" ng-class="{ active: item.removing }"><i class="fa" ng-class="{ 'fa-trash-o': !item.removing, 'fa-cog fa-spin': item.removing }"></i></td>
    </tr>
  </tbody>
</table>

{% if user._id.toString() === channel._owner && channel.playlist.length == 0 %}
<div class="well" ng-if="playlist.length == 0">
  <h2>Hello, {{user.display_name}}!</h2>
  <h4>It seems, you are here for the first time. Let me introduce you some of the Things you'll have to learn:</h4>
  <p>See that <i class="fa fa-plus"></i> up there? Click on it to add new Items to the playlist. So obviously the <i class="fa fa-search"></i> is for Searching Items.</p>
  <p>You also have the ability to force-play an item on all clients, simply by clicking on it.</p>
  <p>Attention: The <i class="fa fa-trash-o"></i> deletes the Item. Use it wth caution, as there's currently no undo for that.</p>
  <p>In the middle there are familiar-looking media controls. Hint: the <i class="fa fa-random"></i> only plays a random item. <i>It does not randomize the playlist.</i></p>
  <p>Now let's enjoy some of this fun! If you find a Bug, have an awesome Idea or simply want to help us improve Synergytube visit us on <a href="https://github.com/TeamSynergy/node-synergytube">GitHub</a>.</p>
  <i class="fa fa-heart" style="color: #dadada"></i>
</div>
{% endif %}



{% endblock %}

{% block js %}
<script src="/socket.io/socket.io.js"></script>
<script src="/assets/vendor/angular/angular.min.js"></script>
<!-- build:js /assets/js/angular.contrib.js -->
<script src="/assets/vendor/angular-animate/angular-animate.min.js"></script>
<script src="/assets/vendor/angular-sanitize/angular-sanitize.min.js"></script>
<!-- endbuild -->
<!-- build:js /assets/js/channel.js -->
<script src="/assets/vendor/angular-moment/angular-moment.min.js"></script>
<script src="/assets/vendor/moment/min/moment.min.js"></script>
<script src="/assets/vendor/jquery-ui/ui/minified/jquery-ui.min.js"></script>
<script src="/assets/vendor/swfobject/swfobject/swfobject.js"></script>
<script src="/assets/vendor/xmbd/build/xmbd.min.js"></script>
<script src="/assets/js/directives/ui-sortable/src/sortable.js"></script>
<script src="/assets/js/controllers/channel.js"></script>
<!-- endbuild -->
<script src="/assets/js/directives/synergy.utils.js"></script>
{% endblock %}
