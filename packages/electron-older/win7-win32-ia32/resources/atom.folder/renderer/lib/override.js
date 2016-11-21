// Generated by CoffeeScript 1.9.3
(function() {
  var BrowserWindowProxy, a, getHistoryOperation, guestId, ipc, process, remote, resolveUrl, sendHistoryOperation,
    slice = [].slice;

  process = global.process;

  ipc = require('ipc');

  remote = require('remote');

  a = window.top.document.createElement('a');

  resolveUrl = function(url) {
    a.href = url;
    return a.href;
  };

  BrowserWindowProxy = (function() {
    function BrowserWindowProxy(guestId1) {
      this.guestId = guestId1;
      this.closed = false;
      ipc.on('ATOM_SHELL_GUEST_WINDOW_MANAGER_WINDOW_CLOSED', (function(_this) {
        return function(guestId) {
          if (guestId === _this.guestId) {
            return _this.closed = true;
          }
        };
      })(this));
    }

    BrowserWindowProxy.prototype.close = function() {
      return ipc.send('ATOM_SHELL_GUEST_WINDOW_MANAGER_WINDOW_CLOSE', this.guestId);
    };

    BrowserWindowProxy.prototype.focus = function() {
      return ipc.send('ATOM_SHELL_GUEST_WINDOW_MANAGER_WINDOW_METHOD', this.guestId, 'focus');
    };

    BrowserWindowProxy.prototype.blur = function() {
      return ipc.send('ATOM_SHELL_GUEST_WINDOW_MANAGER_WINDOW_METHOD', this.guestId, 'blur');
    };

    BrowserWindowProxy.prototype.postMessage = function(message, targetOrigin) {
      if (targetOrigin == null) {
        targetOrigin = '*';
      }
      return ipc.send('ATOM_SHELL_GUEST_WINDOW_MANAGER_WINDOW_POSTMESSAGE', this.guestId, message, targetOrigin);
    };

    BrowserWindowProxy.prototype["eval"] = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return ipc.send.apply(ipc, ['ATOM_SHELL_GUEST_WINDOW_MANAGER_WEB_CONTENTS_METHOD', this.guestId, 'executeJavaScript'].concat(slice.call(args)));
    };

    return BrowserWindowProxy;

  })();

  if (process.guestInstanceId == null) {
    window.close = function() {
      return remote.getCurrentWindow().close();
    };
  }

  window.open = function(url, frameName, features) {
    var arg, feature, guestId, i, ints, j, k, len, len1, len2, name, options, ref, ref1, ref2, value;
    if (frameName == null) {
      frameName = '';
    }
    if (features == null) {
      features = '';
    }
    options = {};
    ints = ['x', 'y', 'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height', 'zoom-factor'];
    ref = features.split(/,\s*/);
    for (i = 0, len = ref.length; i < len; i++) {
      feature = ref[i];
      ref1 = feature.split(/\s*=/), name = ref1[0], value = ref1[1];
      options[name] = value === 'yes' || value === '1' ? true : value === 'no' || value === '0' ? false : value;
    }
    if (options.left) {
      if (options.x == null) {
        options.x = options.left;
      }
    }
    if (options.top) {
      if (options.y == null) {
        options.y = options.top;
      }
    }
    if (options.title == null) {
      options.title = frameName;
    }
    if (options.width == null) {
      options.width = 800;
    }
    if (options.height == null) {
      options.height = 600;
    }
    url = resolveUrl(url);
    for (j = 0, len1 = ints.length; j < len1; j++) {
      name = ints[j];
      if (options[name] != null) {
        options[name] = parseInt(options[name], 10);
      }
    }
    if (options['node-integration'] == null) {
      ref2 = process.argv;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        arg = ref2[k];
        if (!(arg.indexOf('--node-integration=') === 0)) {
          continue;
        }
        options['node-integration'] = arg.substr(-4) === 'true';
        break;
      }
    }
    guestId = ipc.sendSync('ATOM_SHELL_GUEST_WINDOW_MANAGER_WINDOW_OPEN', url, frameName, options);
    if (guestId) {
      return new BrowserWindowProxy(guestId);
    } else {
      console.error('It is not allowed to open new window from this WebContents');
      return null;
    }
  };

  window.alert = function(message, title) {
    var buttons, dialog;
    if (title == null) {
      title = '';
    }
    dialog = remote.require('dialog');
    buttons = ['OK'];
    message = message.toString();
    dialog.showMessageBox(remote.getCurrentWindow(), {
      message: message,
      title: title,
      buttons: buttons
    });
  };

  window.confirm = function(message, title) {
    var buttons, cancelId, dialog;
    if (title == null) {
      title = '';
    }
    dialog = remote.require('dialog');
    buttons = ['OK', 'Cancel'];
    cancelId = 1;
    return !dialog.showMessageBox(remote.getCurrentWindow(), {
      message: message,
      title: title,
      buttons: buttons,
      cancelId: cancelId
    });
  };

  window.prompt = function() {
    throw new Error('prompt() is and will not be supported.');
  };

  guestId = ipc.sendSync('ATOM_SHELL_GUEST_WINDOW_MANAGER_GET_GUEST_ID');

  if (guestId != null) {
    window.opener = {
      postMessage: function(message, targetOrigin) {
        if (targetOrigin == null) {
          targetOrigin = '*';
        }
        return ipc.send('ATOM_SHELL_GUEST_WINDOW_MANAGER_WINDOW_OPENER_POSTMESSAGE', guestId, message, targetOrigin, location.origin);
      }
    };
  }

  ipc.on('ATOM_SHELL_GUEST_WINDOW_POSTMESSAGE', function(guestId, message, sourceOrigin) {
    var event;
    event = document.createEvent('Event');
    event.initEvent('message', false, false);
    event.data = message;
    event.origin = sourceOrigin;
    event.source = new BrowserWindowProxy(guestId);
    return window.dispatchEvent(event);
  });

  sendHistoryOperation = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return ipc.send.apply(ipc, ['ATOM_SHELL_NAVIGATION_CONTROLLER'].concat(slice.call(args)));
  };

  getHistoryOperation = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return ipc.sendSync.apply(ipc, ['ATOM_SHELL_SYNC_NAVIGATION_CONTROLLER'].concat(slice.call(args)));
  };

  window.history.back = function() {
    return sendHistoryOperation('goBack');
  };

  window.history.forward = function() {
    return sendHistoryOperation('goForward');
  };

  window.history.go = function(offset) {
    return sendHistoryOperation('goToOffset', offset);
  };

  Object.defineProperty(window.history, 'length', {
    get: function() {
      return getHistoryOperation('length');
    }
  });

}).call(this);