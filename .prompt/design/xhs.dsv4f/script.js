(function () {
  'use strict';

  /* ---- 回到顶部 ---- */
  var backTop = document.getElementById('backTop');
  if (backTop) {
    function onScroll() {
      var top = window.pageYOffset || document.documentElement.scrollTop;
      if (top > 300) backTop.classList.add('show');
      else backTop.classList.remove('show');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  /* ---- 文章页：点赞 / 收藏切换 ---- */
  var likeBtn = document.getElementById('likeBtn');
  var likeCount = document.getElementById('likeCount');
  if (likeBtn && likeCount) {
    var liked = false;
    var baseLike = 12800;
    likeBtn.addEventListener('click', function () {
      liked = !liked;
      likeBtn.classList.toggle('active', liked);
      var v = liked ? baseLike + 1 : baseLike;
      likeCount.textContent = v >= 10000 ? (v / 10000).toFixed(1) + 'w' : String(v);
    });
  }

  var favBtn = document.getElementById('favBtn');
  var favCount = document.getElementById('favCount');
  if (favBtn && favCount) {
    var faved = false;
    var baseFav = 3200;
    favBtn.addEventListener('click', function () {
      faved = !faved;
      favBtn.classList.toggle('active', faved);
      var v = faved ? baseFav + 1 : baseFav;
      favCount.textContent = v >= 10000 ? (v / 10000).toFixed(1) + 'w' : String(v);
    });
  }

  /* ---- 评论输入框启用发送按钮 ---- */
  var commentInput = document.getElementById('commentInput');
  var commentSubmit = document.getElementById('commentSubmit');
  var commentList = document.querySelector('.comment-list');
  if (commentInput && commentSubmit) {
    commentInput.addEventListener('input', function () {
      commentSubmit.classList.toggle('active', commentInput.value.trim().length > 0);
      commentSubmit.disabled = commentInput.value.trim().length === 0;
    });
    commentSubmit.addEventListener('click', function () {
      var text = commentInput.value.trim();
      if (!text) return;

      var div = document.createElement('div');
      div.className = 'comment-item';

      var avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.style.background = 'linear-gradient(135deg,#a1c4fd,#c2e9fb)';
      avatar.textContent = '我';

      var main = document.createElement('div');
      main.className = 'comment-main';

      var head = document.createElement('div');
      head.className = 'comment-head';
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
      foot.className = 'comment-foot';
      var likes = document.createElement('span');
      likes.textContent = '0';
      var reply = document.createElement('span');
      reply.textContent = '回复';
      foot.appendChild(likes);
      foot.appendChild(reply);

      main.appendChild(head);
      main.appendChild(p);
      main.appendChild(foot);
      div.appendChild(avatar);
      div.appendChild(main);

      commentList.appendChild(div);
      commentInput.value = '';
      commentSubmit.classList.remove('active');
      commentSubmit.disabled = true;
    });
  }

  /* ---- 卡片收藏按钮点击反馈 ---- */
  document.querySelectorAll('.like-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      btn.textContent = btn.textContent === '♡' ? '♥' : '♡';
      btn.classList.toggle('active', false);
    });
  });
})();