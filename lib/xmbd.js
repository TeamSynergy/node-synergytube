var vimeo = require('vimeo')();

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
  else
    fn('unknown provider');
}

