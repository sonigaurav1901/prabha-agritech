import { defineType, defineField } from 'sanity'

export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: '💡 Pro Tip', value: 'tip' },
          { title: '⚠️ Watch Out', value: 'warning' },
          { title: '📌 Quick Note', value: 'note' },
          { title: '✅ Best Practice', value: 'success' },
          { title: '🌱 Field Story', value: 'case' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title (optional)',
      type: 'string',
      description: 'If blank, the variant default heading is shown',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    validation: (r) => r.required(),
                  }),
                ],
              },
            ],
          },
        },
      ],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { variant: 'variant', title: 'title' },
    prepare: ({ variant, title }) => ({
      title: title || `${variant} callout`,
      subtitle: variant,
    }),
  },
})
