import { defineType, defineField } from 'sanity'

export const vertical = defineType({
  name: 'vertical',
  title: 'Vertical (Service)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      description: 'e.g. Prabha Shroom',
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      description: 'shroom | hive | fresh | learn | technovation',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tagline',
      type: 'string',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'shortDescription',
      type: 'text',
      rows: 3,
      description: 'Used on flip card back face',
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
          ],
        },
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'iconName',
      type: 'string',
      description: 'Lucide icon name (e.g. sprout, flower-2, leaf, graduation-cap, cpu)',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'cardImage',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
          ],
        },
      ],
    }),
    defineField({
      name: 'features',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'feature',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              validation: (r) => r.required().max(60),
            }),
            defineField({
              name: 'description',
              type: 'text',
              rows: 2,
              validation: (r) => r.required().max(200),
            }),
            defineField({
              name: 'iconName',
              type: 'string',
              description: 'Lucide icon name',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'colorTheme',
      type: 'string',
      options: {
        list: [
          { title: 'Forest Green', value: 'forest-green' },
          { title: 'Honey Amber', value: 'honey-amber' },
          { title: 'Aqua Blue', value: 'aqua-blue' },
          { title: 'Solar Yellow', value: 'solar-yellow' },
          { title: 'Circuit Teal', value: 'circuit-teal' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'services',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'e.g. Training Workshops, Consultancy, Setup',
    }),
    defineField({
      name: 'relatedProjects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({
      name: 'displayOrder',
      type: 'number',
      description: 'Order on home page (Shroom=1, Hive=2, Fresh=3, Learn=4, Technovation=5)',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'seoTitle', type: 'string' }),
    defineField({ name: 'seoDescription', type: 'text', rows: 2 }),
    defineField({ name: 'ogImage', type: 'image' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'tagline', media: 'cardImage' },
  },
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
})
