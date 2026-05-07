import { post } from './post'
import { category } from './category'
import { teamMember } from './teamMember'
import { testimonial } from './testimonial'
import { project } from './project'
import { vertical } from './vertical'
import { workshop } from './workshop'
import { partner } from './partner'
import { youtube } from './blocks/youtube'
import { callout } from './blocks/callout'

export const schemaTypes = [
  // Document types
  post,
  category,
  teamMember,
  testimonial,
  project,
  vertical,
  workshop,
  partner,
  // Inline object types (used in Portable Text fields)
  youtube,
  callout,
]
