(function(blocks, element) {
  var el = element.createElement;
  blocks.registerBlockType('typegeez/editor', {
    title: 'Type Geez Editor',
    icon: 'translation',
    category: 'widgets',
    edit: function(props) {
      return el('div', {className: 'typegeez-block-placeholder'}, 'Type Geez Editor (preview available in editor)');
    },
    save: function() { return null; } // server-side render
  });
})(window.wp.blocks, window.wp.element);
