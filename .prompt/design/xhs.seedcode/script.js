(function () {
  'use strict';

  /* ===== 回到顶部 ===== */
  var backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      backTop.classList.toggle('show', y > 300);
    }, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== 文章页：点赞 / 收藏 toggle ===== */
  var btnLike = document.getElementById('btnLike');
  var cntLike = document.getElementById('cntLike');
  if (btnLike && cntLike) {
    var liked = false;
    var baseLike = 12834;
    btnLike.addEventListener('click', function () {
      liked = !liked;
      btnLike.classList.toggle('active', liked);
      cntLike.textContent = liked ? baseLike + 1 : baseLike;
    });
  }

  var btnFav = document.getElementById('btnFav');
  var cntFav = document.getElementById('cntFav');
  if (btnFav && cntFav) {
    var faved = false;
    var baseFav = 3210;
    btnFav.addEventListener('click', function () {
      faved = !faved;
      btnFav.classList.toggle('active', faved);
      cntFav.textContent = faved ? baseFav + 1 : baseFav;
    });
  }

  /* ===== 评论输入 & 发送 ===== */
  var commentInput = document.getElementById('commentInput');
  var commentSend  = document.getElementById('commentSend');
  var commentList  = document.getElementById('commentList');

  if (commentInput && commentSend) {
    commentInput.addEventListener('input', function () {
      var has = commentInput.value.trim().length > 0;
      commentSend.classList.toggle('active', has);
      commentSend.disabled = !has;
    });

    if (commentList) {
      commentSend.addEventListener('click', function () {
        var text = commentInput.value.trim();
        if (!text) return;

        var wrap = document.createElement('div');
        wrap.className = 'comment-item';

        var av = document.createElement('div');
        av.className = 'av av-sm';
        av.style.background = 'linear-gradient(135deg,#a1c4fd,#c2e9fb)';
        av.textContent = '我';

        var main = document.createElement('div');
        main.className = 'c-main';

        var head = document.createElement('div');
        head.className = 'c-head';
        var name = document.createElement('span');
        name.className = 'c-name';
        name.textContent = '我';
        var time = document.createElement('span');
        time.className = 'c-time';
        time.textContent = '刚刚';
        head.appendChild(name);
        head.appendChild(time);

        var p = document.createElement('p');
        p.className = 'c-text';
        p.textContent = text;

        var foot = document.createElement('div');
        foot.className = 'c-foot';
        foot.innerHTML = '<span>0</span><span>回复</span>';

        main.appendChild(head);
        main.appendChild(p);
        main.appendChild(foot);
        wrap.appendChild(av);
        wrap.appendChild(main);

        commentList.prepend(wrap);
        commentInput.value = '';
        commentSend.classList.remove('active');
        commentSend.disabled = true;
      });
    }
  }
})();