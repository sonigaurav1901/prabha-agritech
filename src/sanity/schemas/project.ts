import { defineType, defineField } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (r) => r.required().max(100),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'location',
      type: 'object',
      fields: [
        defineField({ name: 'city', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'state', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'country', type: 'string', initialValue: 'India' }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'coordinates',
      type: 'geopoint',
      description: 'Pin location for the India map animation',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'projectType',
      type: 'string',
      description: 'e.g. Integrated model farm, Training hub, R&D facility',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'focus',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'verticals',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'vertical' }] }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(300),
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
            defineField({ name: 'caption', type: 'string' }),
          ],
        },
      ],
      description: 'Full case study for project detail page',
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
      name: 'gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'caption', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'outcomes',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'outcome',
          fields: [
            defineField({
              name: 'metric',
              type: 'string',
              description: 'e.g. Mushroom bags per cycle',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'value',
              type: 'string',
              description: 'e.g. 2,000 or 20+',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'iconName',
              type: 'string',
              description: 'Lucide icon name (optional)',
            }),
          ],
          preview: {
            select: { title: 'metric', subtitle: 'value' },
          },
        },
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: 'Operational', value: 'operational' },
          { title: 'Under Construction', value: 'under-construction' },
          { title: 'Pilot', value: 'pilot' },
          { title: 'Expanding', value: 'expanding' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'startedYear',
      type: 'number',
      validation: (r) => r.min(2000).max(new Date().getFullYear()),
    }),
    defineField({
      name: 'partner',
      type: 'reference',
      to: [{ type: 'partner' }],
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'displayOrder',
      type: 'number',
      initialValue: 100,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      city: 'location.city',
      state: 'location.state',
      media: 'coverImage',
    },
    prepare: ({ title, city, state, media }) => ({
      title,
      subtitle: [city, state].filter(Boolean).join(', '),
      media,
    }),
  },
})
