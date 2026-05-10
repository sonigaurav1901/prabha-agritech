import { defineType, defineField } from 'sanity'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'role',
      type: 'string',
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Leadership', value: 'leadership' },
          { title: 'Advisor', value: 'advisor' },
          { title: 'Field Team', value: 'field-team' },
          { title: 'Trainer', value: 'trainer' },
          { title: 'Researcher', value: 'researcher' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bio',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(500),
    }),
    defineField({
      name: 'longBio',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich bio shown on individual profile page',
    }),
    defineField({
      name: 'expertise',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: (r) => r.email(),
    }),
    defineField({ name: 'linkedin', type: 'url' }),
    defineField({ name: 'instagram', type: 'url' }),
    defineField({ name: 'twitter', type: 'url' }),
    defineField({ name: 'youtube', type: 'url' }),
    defineField({ name: 'facebook', type: 'url' }),
    defineField({
      name: 'website',
      type: 'url',
      description: 'Personal website',
    }),
    defineField({
      name: 'displayOrder',
      type: 'number',
      description: 'Lower numbers appear first',
      initialValue: 100,
    }),
    defineField({ name: 'isFounder', type: 'boolean', initialValue: false }),
    defineField({ name: 'isActive', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
})
