import { defineType, defineField } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Blog Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', type: 'text', rows: 2 }),
    defineField({
      name: 'color',
      type: 'string',
      description: 'Hex color for the category tag (e.g. #3F8E29)',
      validation: (r) =>
        r.regex(/^#([0-9a-fA-F]{6})$/, { name: 'hex color' }).warning('Use a 6-digit hex like #3F8E29'),
    }),
    defineField({
      name: 'icon',
      type: 'string',
      description: 'Lucide icon name (e.g. "leaf", "sprout", "lightbulb")',
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'description' } },
})
