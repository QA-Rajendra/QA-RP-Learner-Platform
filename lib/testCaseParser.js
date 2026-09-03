/**
 * Intelligent utility to parse various pasted test case formats into structured test steps.
 * Supported formats:
 * - Table (Markdown / Pipe-delimited with dynamic column mapping)
 * - Excel (Tab-separated)
 * - CSV (Comma-separated)
 * - Plain Text (Step 1:, Expected:, etc.)
 * - Structured (JSON or BDD Given/When/Then)
 */

export function parseTestCaseContent(content, formatHint = 'auto') {
  if (!content || typeof content !== 'string') {
    return { steps: [], format: 'structured' };
  }

  const trimmed = content.trim();

  // Try JSON first if content looks like JSON
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const steps = parsed.map((item, index) => ({
          stepNumber: item.stepNumber || item.stepNo || index + 1,
          action: item.action || item.step || item.description || '',
          testData: item.testData || item.data || item.input || 'N/A',
          expectedResult: item.expectedResult || item.expected || item.result || '',
          status: item.status || 'Not Run',
        }));
        return { steps, format: 'structured' };
      }
    } catch (e) {
      // Continue to other parsers
    }
  }

  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { steps: [], format: 'plain_text' };

  // 1. Table format (Pipes `|` detected)
  const pipeLines = lines.filter(l => l.includes('|'));
  if (pipeLines.length >= 2) {
    let headerIndices = {
      id: -1,
      scenario: -1,
      step: -1,
      action: -1,
      data: -1,
      expected: -1,
      priority: -1,
    };

    let hasHeader = false;
    let dataRows = [];

    for (const rawLine of pipeLines) {
      // Skip divider lines like |---|---|
      if (/^\|?(\s*:?-+:?\s*\|)+\s*$/.test(rawLine)) continue;

      // Extract cells between pipes
      const parts = rawLine.split('|').map(c => c.trim());
      // Drop empty boundary elements caused by leading/trailing pipes
      const cells = parts.filter((_, idx, arr) => {
        if (idx === 0 && rawLine.startsWith('|')) return false;
        if (idx === arr.length - 1 && rawLine.endsWith('|')) return false;
        return true;
      });

      if (cells.length < 2) continue;

      // Check if this is the header row
      const lineLower = rawLine.toLowerCase();
      if (!hasHeader && (
        lineLower.includes('scenario') ||
        lineLower.includes('step') ||
        lineLower.includes('action') ||
        lineLower.includes('expected') ||
        lineLower.includes('tc id') ||
        lineLower.includes('test data')
      )) {
        hasHeader = true;
        cells.forEach((cell, idx) => {
          const c = cell.toLowerCase();
          if (c.includes('tc id') || c === 'id' || c === 'tc_id') headerIndices.id = idx;
          else if (c.includes('scenario')) headerIndices.scenario = idx;
          else if (c.includes('step') && !c.includes('test data')) headerIndices.step = idx;
          else if (c.includes('action') || c.includes('objective')) headerIndices.action = idx;
          else if (c.includes('data') || c.includes('input') || c.includes('param')) headerIndices.data = idx;
          else if (c.includes('expected') || c.includes('result') || c.includes('outcome')) headerIndices.expected = idx;
          else if (c.includes('priority')) headerIndices.priority = idx;
        });
        continue;
      }

      dataRows.push(cells);
    }

    if (dataRows.length > 0) {
      const steps = dataRows.map((cells, index) => {
        let action = '';
        let testData = '';
        let expected = '';

        if (hasHeader) {
          // Action mapping priority: Action > Steps > Scenario
          const actionIdx = headerIndices.action !== -1 ? headerIndices.action : (headerIndices.step !== -1 ? headerIndices.step : headerIndices.scenario);
          const secondaryIdx = headerIndices.scenario !== -1 && headerIndices.scenario !== actionIdx ? headerIndices.scenario : -1;

          action = cells[actionIdx] || '';
          if (secondaryIdx !== -1 && cells[secondaryIdx] && cells[secondaryIdx] !== action) {
            action = `${cells[secondaryIdx]} — ${action}`.trim();
          }

          if (headerIndices.data !== -1 && cells[headerIndices.data]) {
            testData = cells[headerIndices.data];
          }

          if (headerIndices.expected !== -1 && cells[headerIndices.expected]) {
            expected = cells[headerIndices.expected];
          }
        }

        // Fallback default column mapping if header mapping didn't find fields
        if (!action) {
          if (cells.length === 2) {
            action = cells[0];
            expected = cells[1];
          } else if (cells.length === 3) {
            action = cells[1];
            expected = cells[2];
          } else if (cells.length === 4) {
            action = cells[1];
            testData = cells[2];
            expected = cells[3];
          } else if (cells.length >= 5) {
            // E.g. TC ID | Scenario | Steps | Data | Expected | Priority
            action = cells[2] ? `${cells[1]}: ${cells[2]}` : cells[1];
            testData = cells[3] || 'N/A';
            expected = cells[4] || '';
          }
        }

        return {
          stepNumber: index + 1,
          action: action || `Execute step ${index + 1}`,
          testData: testData || 'N/A',
          expectedResult: expected || 'Action verified successfully',
          status: 'Not Run',
        };
      });

      return { steps, format: 'table' };
    }
  }

  // 2. Excel (Tab-separated values)
  const tsvLines = lines.filter(l => l.includes('\t'));
  if (tsvLines.length >= 1) {
    const steps = [];
    let stepCount = 1;
    for (const line of tsvLines) {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 2) {
        const first = parts[0].toLowerCase();
        if (first.includes('step') && parts[1]?.toLowerCase().includes('action')) continue;

        let action = parts.length > 2 ? parts[1] : parts[0];
        let testData = parts.length > 3 ? parts[2] : 'N/A';
        let expected = parts.length > 3 ? parts[3] : parts[parts.length - 1];

        steps.push({
          stepNumber: stepCount++,
          action: action || 'Execute step',
          testData: testData || 'N/A',
          expectedResult: expected || 'Expected outcome',
          status: 'Not Run',
        });
      }
    }
    if (steps.length > 0) return { steps, format: 'excel' };
  }

  // 3. CSV (Comma-separated values)
  if (lines.length > 1 && lines[0].includes(',') && lines[1].includes(',')) {
    const steps = [];
    let stepCount = 1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 2) {
        if (i === 0 && (parts[0].toLowerCase().includes('step') || parts[1]?.toLowerCase().includes('action'))) continue;

        let action = parts.length > 2 ? parts[1] : parts[0];
        let testData = parts.length > 3 ? parts[2] : 'N/A';
        let expected = parts.length > 3 ? parts[3] : parts[parts.length - 1];

        steps.push({
          stepNumber: stepCount++,
          action: action || 'Execute action',
          testData: testData || 'N/A',
          expectedResult: expected || 'Action should succeed',
          status: 'Not Run',
        });
      }
    }
    if (steps.length > 0) return { steps, format: 'csv' };
  }

  // 4. Plain Text / BDD Format (e.g. Step 1: ..., Expected Result: ...)
  const steps = [];
  let currentStep = null;
  let stepIndex = 1;

  for (const line of lines) {
    const stepMatch = line.match(/^(?:Step\s*(\d+)[:.]?|\d+[.:])\s*(.*)$/i);
    const expectedMatch = line.match(/^(?:Expected(?:\s*Result)?[:.]?|Then\s+)\s*(.*)$/i);
    const actionMatch = line.match(/^(?:Action|When|Given|And)[:.]?\s*(.*)$/i);
    const dataMatch = line.match(/^(?:Test\s*Data|Input|Parameters)[:.]?\s*(.*)$/i);

    if (stepMatch) {
      if (currentStep) steps.push(currentStep);
      currentStep = {
        stepNumber: stepMatch[1] ? parseInt(stepMatch[1], 10) : stepIndex++,
        action: stepMatch[2] || '',
        testData: 'Valid Inputs',
        expectedResult: 'Expected outcome as documented',
        status: 'Not Run',
      };
    } else if (expectedMatch && currentStep) {
      currentStep.expectedResult = expectedMatch[1] || currentStep.expectedResult;
    } else if (dataMatch && currentStep) {
      currentStep.testData = dataMatch[1] || currentStep.testData;
    } else if (actionMatch && currentStep && !currentStep.action) {
      currentStep.action = actionMatch[1];
    } else if (currentStep) {
      currentStep.action += (currentStep.action ? ' ' : '') + line;
    } else {
      currentStep = {
        stepNumber: stepIndex++,
        action: line,
        testData: 'Standard data',
        expectedResult: 'System performs as specified',
        status: 'Not Run',
      };
    }
  }

  if (currentStep) steps.push(currentStep);

  // If still empty or single block
  if (steps.length === 0 && trimmed.length > 0) {
    steps.push({
      stepNumber: 1,
      action: trimmed.slice(0, 150),
      testData: 'N/A',
      expectedResult: 'Verify successful execution without errors',
      status: 'Not Run',
    });
  }

  return { steps, format: formatHint !== 'auto' ? formatHint : 'plain_text' };
}
