import { unified }          from 'unified';
import remarkParse          from 'remark-parse';
import remarkGfm            from 'remark-gfm';
import { visit, SKIP }      from 'unist-util-visit';
import { toString }         from 'mdast-util-to-string';

const MAX_SECTION_BODY = 800;

/**
 * @param {string} markdown  - Raw file content
 * @param {object} meta      - { sessionLabel, moduleLabel, courseLabel, domain, globalSlideOffset }
 * @returns {import('../types/slide.types').ModuleDoc}
 */
export function parseModule(markdown, meta) {
  const stripped = markdown
    .replace(/^---[\s\S]+?---\n/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const tree = unified().use(remarkParse).use(remarkGfm).parse(stripped);

  let moduleTitle   = '';
  const sections    = [];
  let currentSection = null;

  visit(tree, (node) => {
    if (node.type === 'heading' && node.depth === 1) {
      moduleTitle = toString(node);
      return SKIP;
    }

    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
      if (currentSection) sections.push(finalizeSection(currentSection));
      currentSection = {
        heading:    toString(node),
        level:      node.depth,
        bodyParts:  [],
        bullets:    [],
        codeBlocks: [],
        tables:     [],
      };
      return SKIP;
    }

    if (!currentSection) return;

    if (node.type === 'paragraph') {
      currentSection.bodyParts.push(toString(node));
      return SKIP;
    }

    if (node.type === 'list') {
      visit(node, 'listItem', (li) => {
        currentSection.bullets.push(toString(li).trim());
      });
      return SKIP;
    }

    if (node.type === 'code') {
      currentSection.codeBlocks.push(node.value);
      return SKIP;
    }

    if (node.type === 'table') {
      const rows = [];
      visit(node, 'tableRow', (row) => {
        const cells = [];
        visit(row, 'tableCell', (cell) => cells.push(toString(cell)));
        rows.push(cells);
      });
      currentSection.tables.push(rows);
      return SKIP;
    }
  });

  if (currentSection) sections.push(finalizeSection(currentSection));

  return {
    moduleTitle:       moduleTitle || slugFromFilename(meta.sourceFile ?? 'module'),
    sessionLabel:      meta.sessionLabel,
    moduleLabel:       meta.moduleLabel,
    courseLabel:       meta.courseLabel ?? 'AI+PRO',
    domain:            meta.domain     ?? 'aiplus.domain',
    globalSlideOffset: meta.globalSlideOffset ?? 0,
    sections,
  };
}

function finalizeSection(s) {
  const body = s.bodyParts.join('\n\n');
  return {
    heading:    s.heading,
    level:      s.level,
    body:       body.length > MAX_SECTION_BODY ? body.slice(0, MAX_SECTION_BODY) + '…' : body,
    bullets:    s.bullets,
    codeBlocks: s.codeBlocks,
    tables:     s.tables,
  };
}

function slugFromFilename(filePath) {
  return filePath
    .split(/[\\/]/).pop()
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
}
