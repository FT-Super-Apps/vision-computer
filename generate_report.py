#!/usr/bin/env python3
"""
Generate readable HTML report dari hasil paraphrase
Menampilkan original vs paraphrased side-by-side
"""

import json
from datetime import datetime
from pathlib import Path

def generate_html_report(paraphrased_json, output_html="paraphrase_report.html"):
    """Generate beautiful HTML report"""
    
    # Load data
    with open(paraphrased_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # HTML template
    html_content = f"""<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Turnitin Paraphrase Report</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            line-height: 1.6;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }}
        
        .header .subtitle {{
            font-size: 1.2em;
            opacity: 0.9;
        }}
        
        .stats {{
            display: flex;
            justify-content: space-around;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 3px solid #667eea;
        }}
        
        .stat-box {{
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            min-width: 150px;
        }}
        
        .stat-box .number {{
            font-size: 3em;
            font-weight: bold;
            color: #667eea;
            display: block;
        }}
        
        .stat-box .label {{
            color: #666;
            font-size: 1.1em;
            margin-top: 10px;
        }}
        
        .content {{
            padding: 40px;
        }}
        
        .comparison-item {{
            margin-bottom: 40px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
        }}
        
        .comparison-item:hover {{
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            border-color: #667eea;
        }}
        
        .item-header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .item-header .title {{
            font-size: 1.3em;
            font-weight: bold;
        }}
        
        .item-header .page-badge {{
            background: rgba(255,255,255,0.3);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }}
        
        .comparison-content {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
        }}
        
        .text-box {{
            padding: 30px;
            background: white;
        }}
        
        .text-box.original {{
            background: #fff3cd;
            border-right: 3px solid #ffc107;
        }}
        
        .text-box.paraphrased {{
            background: #d4edda;
        }}
        
        .text-box h3 {{
            font-size: 1.2em;
            margin-bottom: 15px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        .text-box h3::before {{
            content: "📝";
            font-size: 1.5em;
        }}
        
        .text-box.paraphrased h3::before {{
            content: "✨";
        }}
        
        .text-box p {{
            font-size: 1.05em;
            color: #333;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.8;
        }}
        
        .similarity-badge {{
            display: inline-block;
            background: #17a2b8;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.85em;
            margin-left: 10px;
        }}
        
        .footer {{
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
            border-top: 3px solid #667eea;
        }}
        
        .footer p {{
            margin: 5px 0;
        }}
        
        .legend {{
            display: flex;
            justify-content: center;
            gap: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 2px solid #e0e0e0;
        }}
        
        .legend-item {{
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        .legend-color {{
            width: 30px;
            height: 30px;
            border-radius: 5px;
            border: 2px solid #ccc;
        }}
        
        .legend-color.original {{
            background: #fff3cd;
        }}
        
        .legend-color.paraphrased {{
            background: #d4edda;
        }}
        
        @media (max-width: 768px) {{
            .comparison-content {{
                grid-template-columns: 1fr;
            }}
            
            .text-box.original {{
                border-right: none;
                border-bottom: 3px solid #ffc107;
            }}
            
            .stats {{
                flex-direction: column;
                gap: 15px;
            }}
        }}
        
        .scroll-top {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #667eea;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            text-decoration: none;
        }}
        
        .scroll-top:hover {{
            background: #764ba2;
            transform: translateY(-5px);
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Turnitin Paraphrase Report</h1>
            <div class="subtitle">Hasil Perbandingan Original vs Paraphrased</div>
            <div class="subtitle" style="margin-top: 10px; font-size: 0.9em;">
                Generated: {datetime.now().strftime('%d %B %Y, %H:%M:%S')}
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-box">
                <span class="number">{len(data)}</span>
                <span class="label">Total Texts</span>
            </div>
            <div class="stat-box">
                <span class="number">{sum(1 for d in data if d.get('similarity_before', 0) >= 90)}</span>
                <span class="label">High Match (≥90%)</span>
            </div>
            <div class="stat-box">
                <span class="number">{sum(1 for d in data if 70 <= d.get('similarity_before', 0) < 90)}</span>
                <span class="label">Medium Match (70-89%)</span>
            </div>
            <div class="stat-box">
                <span class="number">{sum(1 for d in data if d.get('similarity_before', 0) < 70)}</span>
                <span class="label">Low Match (&lt;70%)</span>
            </div>
        </div>
        
        <div class="legend">
            <div class="legend-item">
                <div class="legend-color original"></div>
                <span><strong>Original Text</strong> (dari DOCX)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color paraphrased"></div>
                <span><strong>Paraphrased Text</strong> (hasil bypass)</span>
            </div>
        </div>
        
        <div class="content">
"""
    
    # Add each comparison
    for i, item in enumerate(data, 1):
        original = item.get('original', '')
        paraphrased = item.get('paraphrased', '')
        page = item.get('page', '?')
        similarity = item.get('similarity_before', 0)
        
        # Truncate if too long for preview
        original_preview = original if len(original) < 500 else original[:500] + "..."
        paraphrased_preview = paraphrased if len(paraphrased) < 500 else paraphrased[:500] + "..."
        
        html_content += f"""
            <div class="comparison-item" id="item-{i}">
                <div class="item-header">
                    <span class="title">#{i}</span>
                    <span class="page-badge">📄 Page {page}</span>
                </div>
                <div class="comparison-content">
                    <div class="text-box original">
                        <h3>Original Text <span class="similarity-badge">{similarity:.1f}% match</span></h3>
                        <p>{original_preview}</p>
                    </div>
                    <div class="text-box paraphrased">
                        <h3>Paraphrased Text</h3>
                        <p>{paraphrased_preview}</p>
                    </div>
                </div>
            </div>
"""
    
    # Close HTML
    html_content += f"""
        </div>
        
        <div class="footer">
            <p><strong>🎓 Turnitin Smart Bypass System</strong></p>
            <p>Total {len(data)} texts successfully paraphrased</p>
            <p style="margin-top: 15px; font-size: 0.9em; color: #999;">
                Techniques used: Intelligent Paraphrasing + Unicode Substitution
            </p>
        </div>
    </div>
    
    <a href="#" class="scroll-top" onclick="window.scrollTo({{top: 0, behavior: 'smooth'}}); return false;">
        ↑
    </a>
</body>
</html>
"""
    
    # Save HTML
    with open(output_html, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ HTML report generated: {output_html}")
    return output_html

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python generate_report.py <paraphrased.json>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    output_file = Path(json_file).stem + "_report.html"
    
    generate_html_report(json_file, output_file)
    
    print(f"\n📊 Report Summary:")
    print(f"   Input JSON : {json_file}")
    print(f"   Output HTML: {output_file}")
    print(f"\n🌐 Open in browser to view the report!")

if __name__ == "__main__":
    main()
