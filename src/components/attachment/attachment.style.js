export default {
  name: 'Attachment',
  selector: '.Attachment',
  validInnerComponents: [
    'Border',
    'ButtonUnstyled',
    'Input'
  ],
  defaultRules: [
    {
      directives: {
        roundness: 3
      }
    },
    {
      component: 'ButtonUnstyled',
      parent: { component: 'Attachment' },
      directives: {
        background: '#FFFFFF',
        opacity: 0.5
      }
    }
  ]
}
