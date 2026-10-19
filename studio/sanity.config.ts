import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes, SINGLETON_TYPES} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'lotus-uae',
  title: 'Lotus UAE',

  projectId: 'rh6f9d38',
  // `sanity dev` reads .env.development, so local editing goes to the
  // development dataset. `sanity build` / deploy don't, so they stay on production.
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool({structure}), visionTool({defaultApiVersion: '2024-10-01'})],

  schema: {
    types: schemaTypes,
    // Singletons exist once, at a fixed ID; keep them out of "Create new".
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETON_TYPES.has(schemaType)),
  },

  document: {
    actions: (actions, {schemaType}) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(
            ({action}) => action && !['duplicate', 'delete', 'unpublish'].includes(action),
          )
        : actions,
  },
})
