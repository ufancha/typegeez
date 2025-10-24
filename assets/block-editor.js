(function(blocks, element) {
  var el = element.createElement;
  blocks.registerBlockType('typegeezwp/editor', {
    title: 'Type Geez WP Editor',
    icon: 'translation',
    category: 'widgets',
    edit: function(props) {
      return el('div', {className: 'typegeez-block-placeholder'}, 'Type Geez WP Editor (preview available in editor)');
    },
    save: function() { return null; } // server-side render
  });
})(window.wp.blocks, window.wp.element);
