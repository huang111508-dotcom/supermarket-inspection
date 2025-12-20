import { InspectionData, Deduction } from "../types";

export function exportToExcel(inspectionData: InspectionData) {
    const records = inspectionData.records;

    // --- Aggregation Logic (Same as in App.tsx) ---
    const aggregatedData = records.reduce((acc, record) => {
        const key = `${record.areaKey}_${record.employee}`;
        if (!acc[key]) {
            acc[key] = {
                name: record.name,
                areaKey: record.areaKey,
                employee: record.employee || 'Unknown',
                totalScore: 0,
                maxScore: record.maxScore,
                count: 0,
                deductions: [],
                redLines: [] // Collect redlines if needed
            };
        }
        acc[key].totalScore += record.score;
        acc[key].count += 1;
        acc[key].deductions.push(...record.deductions);
        if (record.redLine && record.redLine.length > 0) {
             acc[key].redLines.push(...record.redLine);
        }
        return acc;
    }, {} as Record<string, {
        name?: string,
        areaKey: string,
        employee: string,
        totalScore: number,
        maxScore: number,
        count: number,
        deductions: Deduction[],
        redLines: string[]
    }>);

    const results = Object.values(aggregatedData).map(item => {
        const avgScore = Number((item.totalScore / item.count).toFixed(1));
        // Remove duplicate redlines
        const uniqueRedLines = [...new Set(item.redLines)];
        return {
            ...item,
            avgScore,
            uniqueRedLines
        };
    });

    const totalAvgScoreSum = results.reduce((sum, item) => sum + item.avgScore, 0);
    const totalMaxScoreSum = results.reduce((sum, item) => sum + item.maxScore, 0);
    const overallPercentage = totalMaxScoreSum > 0 ? (totalAvgScoreSum / totalMaxScoreSum * 100).toFixed(1) : '0.0';


    // 创建HTML表格内容
    let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <title>巡店检查报告</title>
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>巡店检查报告</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #3498db;
                    color: white;
                }
            </style>
        </head>
        <body>
            <h1>巡店检查报告</h1>
            <p>检查人: ${inspectionData.inspector}</p>
            <p>门店名称: ${inspectionData.shop}</p>
            <p>检查日期: ${inspectionData.date}</p>
            <p>总检查记录数: ${records.length}</p>
            
            <h2>总分 (所有员工平均分之和): ${totalAvgScoreSum.toFixed(1)} / ${totalMaxScoreSum} (${overallPercentage}%)</h2>
            
            <h3>员工得分汇总 (同员工多次检查取平均)</h3>
            <table>
                <tr>
                    <th>区域</th>
                    <th>员工</th>
                    <th>检查次数</th>
                    <th>平均分</th>
                    <th>满分</th>
                    <th>得分率</th>
                </tr>
    `;
    
    // 添加各记录得分
    results.forEach(item => {
        let areaName = item.name || item.areaKey;
        const pct = item.maxScore > 0 ? (item.avgScore / item.maxScore * 100).toFixed(1) : '0.0';
        
        html += `
            <tr>
                <td>${areaName}</td>
                <td>${item.employee}</td>
                <td>${item.count}</td>
                <td>${item.avgScore}</td>
                <td>${item.maxScore}</td>
                <td>${pct}%</td>
            </tr>
        `;
    });
    
    html += `
            </table>
            
            <h3>详细扣分项</h3>
    `;
    
    // 添加详细扣分项
    results.forEach(item => {
        if (item.deductions.length > 0) {
            html += `<h4>${item.name} (${item.employee}) - 平均分: ${item.avgScore}</h4><table>`;
            html += `
                <tr>
                    <th>检查项目</th>
                    <th>检查标准</th>
                    <th>单次得分</th>
                    <th>满分</th>
                    <th>扣分原因</th>
                </tr>
            `;
            
            item.deductions.forEach(deduction => {
                html += `
                    <tr>
                        <td>${deduction.item}</td>
                        <td>${deduction.standard}</td>
                        <td>${deduction.score}</td>
                        <td>${deduction.maxScore}</td>
                        <td>${deduction.criteria}</td>
                    </tr>
                `;
            });
            
            html += `</table>`;
        }
    });
    
    // 添加红线条款
    html += `<h3>红线条款</h3><ul>`;
    results.forEach(item => {
         html += `<li><strong>${item.name} (${item.employee}):</strong><ul>`;
         if (item.uniqueRedLines && item.uniqueRedLines.length > 0) {
             item.uniqueRedLines.forEach(line => {
                 html += `<li>${line}</li>`;
             });
         } else {
             html += `<li>无</li>`;
         }
         html += `</ul></li>`;
    });
    html += `</ul>`;
    
    html += `
        </body>
        </html>
    `;
    
    // 创建Blob对象
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `巡店检查报告_${inspectionData.shop}_${inspectionData.date.replace(/[: ]/g, '-')}.xls`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }, 100);
}