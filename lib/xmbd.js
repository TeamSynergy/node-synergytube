var vimeo = require('vimeo')();
var request = require('request');

exports.getThumbnail = function(prov, media_id, fn){
  if(prov === 'youtube')
    return fn(null, '//img.youtube.com/vi/' + media_id + '/mqdefault.jpg');

  else if(prov === 'vimeo')
    vimeo.video(media_id, function(err, res){
      if(err)  return fn(err);
      return fn(null, res[0].thumbnail_large.replace('http://', '//'));
    });

  else if(prov === 'dailymotion')
    return fn(null, '//www.dailymotion.com/thumbnail/video/' + media_id);

  else
    return fn('unknown provider');
};

exports.getInfo = function(prov, media_id, fn){
  if(prov === 'vimeo')
    vimeo.video(media_id, function(err, res){
      if(err)  return fn(err);
      fn(null, {
        name: res[0].title,
        provider: 'vimeo',
        id: media_id,
        duration: res[0].duration,
        available: res[0].embed_privacy == 'anywhere'
      });
    });

  else if(prov === 'youtube'){
    request('https://gdata.youtube.com/feeds/api/videos/' + media_id + '?alt=json&format=5', function(err, res, body){
      if(err || res.statusCode !== 200)  return fn(err || res.statusCode);
      var yt = JSON.parse(body).entry;
      var d = -1;
      var a = false;

      yt.media$group.media$content.forEach(function(item){
        if(item.yt$format === 5){
          d = item.duration;
          a = true;
        }
      });

      return fn(null, {
        name: yt.title.$t,
        provider: 'youtube',
        id: media_id,
        duration: d,
        available: a
      });
    });
  }

  else if(prov === 'dailymotion'){
    request('https://api.dailymotion.com/video/' + media_id + '?fields=title,duration,embed_url', function(err, res, body){
      if(err || res.statusCode !== 200)  return fn(err || res.statusCode);
      var info = JSON.parse(body);
      if(info.error)  return fn(info.error);
      return fn(null, {
        name: info.title,
        provider: 'dailymotion',
        id: media_id,
        duration: info.duration,
        available: !!info.embed_url
      });
    });
  }

  else
    fn('unknown provider');
}

