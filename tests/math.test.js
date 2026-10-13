import test from 'node:test';import assert from 'node:assert/strict';
import {mathMarkdown,mathToken} from '../extension/math.js';
test('math is recognized before Markdown escapes and leaves code untouched',()=>{
 const source=[String.raw`行内 \(n=1\) 和 $E=mc^2$。`,'',String.raw`\[x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}\]`,'',String.raw`$$\begin{pmatrix}1&2\\3&4\end{pmatrix}$$`,'','代码：`\\(n=2\\)`','','```tex','\\[x^2\\]','```'].join('\n');
 const result=mathMarkdown(source);assert.equal(result.formulas.size,4);assert.ok([...result.formulas.values()].some(t=>t.tex.includes('\\frac')));
 assert.ok(result.html.includes('<code>'));assert.equal(mathMarkdown('价格 $5 和 $10').formulas.size,0);
});
test('unfinished streaming delimiters stay text; environments and aligned equations retain newlines',()=>{
 assert.equal(mathToken('\\[unfinished',true),undefined);
 const r=mathMarkdown(String.raw`\begin{align}a&=b\\c&=d\end{align}`);assert.equal(r.formulas.size,1);assert.equal([...r.formulas.values()][0].display,true);
});