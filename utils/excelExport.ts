
import { InspectionData, Deduction } from "../types";

const escape = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

export function exportToExcel(inspectionData: InspectionData) {
    const records = inspectionData.records;

    // --- Aggregation Logic (Same as before) ---
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
                redLines: [] 
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
        const uniqueRedLines = [...new Set(item.redLines)];
        return { ...item, avgScore, uniqueRedLines };
    });

    const totalAvgScoreSum = results.reduce((sum, item) => sum + item.avgScore, 0);
    const totalMaxScoreSum = results.reduce((sum, item) => sum + item.maxScore, 0);
    const overallPercentage = totalMaxScoreSum > 0 ? (totalAvgScoreSum / totalMaxScoreSum * 100).toFixed(1) : '0.0';

    // --- XML Spreadsheet 2003 Generation ---
    let xml = '<?xml version="1.0"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
    xml += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
    xml += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
    xml += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
    xml += 'xmlns:html="http://www.w3.org/TR/REC-html40">\n';

    // --- Styles ---
    xml += '<Styles>\n';
    xml += ' <Style ss:ID="Default" ss:Name="Normal">\n';
    xml += '  <Alignment ss:Vertical="Center"/>\n';
    xml += '  <Borders/>\n';
    xml += '  <Font ss:FontName="Microsoft YaHei" x:CharSet="134" ss:Size="11" ss:Color="#000000"/>\n';
    xml += '  <Interior/>\n';
    xml += '  <NumberFormat/>\n';
    xml += '  <Protection/>\n';
    xml += ' </Style>\n';
    
    // Header Style (Blue bg, White text, Bold)
    xml += ' <Style ss:ID="sHeader">\n';
    xml += '  <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n';
    xml += '  <Borders>\n';
    xml += '   <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>\n';
    xml += '   <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>\n';
    xml += '   <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>\n';
    xml += '   <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>\n';
    xml += '  </Borders>\n';
    xml += '  <Font ss:FontName="Microsoft YaHei" x:CharSet="134" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>\n';
    xml += '  <Interior ss:Color="#3498db" ss:Pattern="Solid"/>\n';
    xml += ' </Style>\n';

    // Bold Text
    xml += ' <Style ss:ID="sBold">\n';
    xml += '  <Font ss:FontName="Microsoft YaHei" x:CharSet="134" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>\n';
    xml += ' </Style>\n';

    // Wrap Text (For Deductions)
    xml += ' <Style ss:ID="sWrap">\n';
    xml += '  <Alignment ss:Vertical="Center" ss:WrapText="1"/>\n';
    xml += ' </Style>\n';
    
    // Bordered Cell
    xml += ' <Style ss:ID="sBorder">\n';
    xml += '  <Borders>\n';
    xml += '   <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>\n';
    xml += '   <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>\n';
    xml += '   <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>\n';
    xml += '   <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>\n';
    xml += '  </Borders>\n';
    xml += ' </Style>\n';

    xml += '</Styles>\n';

    // ==========================================
    // SHEET 1: Summary Report
    // ==========================================
    xml += '<Worksheet ss:Name="检查报告汇总">\n';
    xml += ' <Table ss:ExpandedColumnCount="6" x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="100">\n';
    xml += '  <Column ss:Width="150"/>\n'; // Area
    xml += '  <Column ss:Width="100"/>\n'; // Employee
    xml += '  <Column ss:Width="80"/>\n';  // Count
    xml += '  <Column ss:Width="80"/>\n';  // Avg
    xml += '  <Column ss:Width="80"/>\n';  // Max
    xml += '  <Column ss:Width="80"/>\n';  // %

    // Title Row
    xml += '  <Row ss:Height="25">\n';
    xml += `   <Cell ss:MergeAcross="5" ss:StyleID="sBold"><Data ss:Type="String">巡店检查报告</Data></Cell>\n`;
    xml += '  </Row>\n';

    // Info Rows
    xml += `  <Row><Cell><Data ss:Type="String">检查人: ${escape(inspectionData.inspector)}</Data></Cell></Row>\n`;
    xml += `  <Row><Cell><Data ss:Type="String">门店: ${escape(inspectionData.shop)}</Data></Cell></Row>\n`;
    xml += `  <Row><Cell><Data ss:Type="String">导出日期: ${escape(inspectionData.date)}</Data></Cell></Row>\n`;
    xml += `  <Row><Cell ss:MergeAcross="5" ss:StyleID="sBold"><Data ss:Type="String">总分 (所有员工平均分之和): ${totalAvgScoreSum.toFixed(1)} / ${totalMaxScoreSum} (${overallPercentage}%)</Data></Cell></Row>\n`;
    xml += '  <Row ss:Height="15"></Row>\n'; // Spacer

    // Summary Table Header
    xml += '  <Row>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">区域</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">员工</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">检查次数</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">平均分</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">满分</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">得分率</Data></Cell>\n';
    xml += '  </Row>\n';

    // Summary Data
    results.forEach(item => {
        let areaName = item.name || item.areaKey;
        const pct = item.maxScore > 0 ? (item.avgScore / item.maxScore * 100).toFixed(1) : '0.0';
        xml += '  <Row>\n';
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${escape(areaName)}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${escape(item.employee)}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="Number">${item.count}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="Number">${item.avgScore}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="Number">${item.maxScore}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${pct}%</Data></Cell>\n`;
        xml += '  </Row>\n';
    });

    xml += '  <Row ss:Height="15"></Row>\n'; // Spacer

    // Detail Deductions
    xml += '  <Row><Cell ss:MergeAcross="5" ss:StyleID="sBold"><Data ss:Type="String">详细扣分项</Data></Cell></Row>\n';
    
    results.forEach(item => {
        if (item.deductions.length > 0) {
            xml += '  <Row ss:Height="5"></Row>\n';
            xml += `  <Row><Cell ss:MergeAcross="5" ss:StyleID="sBold"><Data ss:Type="String">${escape(item.name)} (${escape(item.employee)}) - 平均分: ${item.avgScore}</Data></Cell></Row>\n`;
            
            // Sub-header
            xml += '  <Row>\n';
            xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">检查项目</Data></Cell>\n';
            xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">检查标准</Data></Cell>\n';
            xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">单次得分</Data></Cell>\n';
            xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">满分</Data></Cell>\n';
            xml += '   <Cell ss:MergeAcross="1" ss:StyleID="sHeader"><Data ss:Type="String">扣分原因</Data></Cell>\n';
            xml += '  </Row>\n';

            item.deductions.forEach(deduction => {
                xml += '  <Row>\n';
                xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${escape(deduction.item)}</Data></Cell>\n`;
                xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${escape(deduction.standard)}</Data></Cell>\n`;
                xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="Number">${deduction.score}</Data></Cell>\n`;
                xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="Number">${deduction.maxScore}</Data></Cell>\n`;
                xml += `   <Cell ss:MergeAcross="1" ss:StyleID="sBorder"><Data ss:Type="String">${escape(deduction.criteria)}</Data></Cell>\n`;
                xml += '  </Row>\n';
            });
        }
    });

    xml += '  <Row ss:Height="15"></Row>\n'; // Spacer

    // Red Lines
    xml += '  <Row><Cell ss:MergeAcross="5" ss:StyleID="sBold"><Data ss:Type="String">红线条款</Data></Cell></Row>\n';
    results.forEach(item => {
         if (item.uniqueRedLines && item.uniqueRedLines.length > 0) {
             item.uniqueRedLines.forEach(line => {
                xml += `  <Row><Cell ss:MergeAcross="5"><Data ss:Type="String">${escape(item.name)} (${escape(item.employee)}): ${escape(line)}</Data></Cell></Row>\n`;
             });
         }
    });

    xml += ' </Table>\n';
    xml += '</Worksheet>\n';

    // ==========================================
    // SHEET 2: Raw Data Records
    // ==========================================
    xml += '<Worksheet ss:Name="检查记录明细">\n';
    xml += ' <Table ss:ExpandedColumnCount="7" x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="100">\n';
    xml += '  <Column ss:Width="120"/>\n'; // Time
    xml += '  <Column ss:Width="80"/>\n';  // Inspector
    xml += '  <Column ss:Width="100"/>\n'; // Area
    xml += '  <Column ss:Width="80"/>\n';  // Employee
    xml += '  <Column ss:Width="60"/>\n';  // Score
    xml += '  <Column ss:Width="60"/>\n';  // Max
    xml += '  <Column ss:Width="400"/>\n'; // Deduction Detail (Long)

    // Header Row
    xml += '  <Row>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">检查时间</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">检查人</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">区域</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">员工姓名</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">得分</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">满分</Data></Cell>\n';
    xml += '   <Cell ss:StyleID="sHeader"><Data ss:Type="String">扣分详情</Data></Cell>\n';
    xml += '  </Row>\n';

    // Data Rows
    records.forEach(r => {
        const timeStr = new Date(r.timestamp).toLocaleString();
        // Fallback to global inspector if record specific inspector isn't saved (for old records)
        const inspectorName = r.inspector || inspectionData.inspector || 'Unknown';
        
        let deductionDetail = '';
        if (r.deductions && r.deductions.length > 0) {
            deductionDetail = r.deductions.map(d => `[${d.item}-${d.standard}]: 扣${d.maxScore - d.score}分 (${d.criteria})`).join('; ');
        } else {
            deductionDetail = '无扣分';
        }

        xml += '  <Row>\n';
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${escape(timeStr)}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${escape(inspectorName)}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${escape(r.name || r.areaKey)}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="String">${escape(r.employee)}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="Number">${r.score}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sBorder"><Data ss:Type="Number">${r.maxScore}</Data></Cell>\n`;
        xml += `   <Cell ss:StyleID="sWrap"><Data ss:Type="String">${escape(deductionDetail)}</Data></Cell>\n`;
        xml += '  </Row>\n';
    });

    xml += ' </Table>\n';
    xml += '</Worksheet>\n';

    xml += '</Workbook>';

    // Create Blob
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    
    // Download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `巡店检查报告_${inspectionData.shop}_${inspectionData.date.replace(/[: ]/g, '-')}.xls`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }, 100);
}
