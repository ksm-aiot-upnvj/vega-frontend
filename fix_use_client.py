import os

def fix_use_client(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    has_use_client = False
    use_client_idx = -1
    
    for i, line in enumerate(lines):
        # normalize quotes and spacing
        cleaned = line.strip().replace("'", '"').replace(';', '')
        if cleaned == '"use client"':
            has_use_client = True
            use_client_idx = i
            break
            
    if has_use_client and use_client_idx > 0:
        # Check if any non-empty line before it is not a comment
        needs_move = False
        for i in range(use_client_idx):
            line = lines[i].strip()
            if line and not line.startswith('//') and not line.startswith('/*'):
                needs_move = True
                break
                
        if needs_move:
            use_client_line = lines.pop(use_client_idx)
            lines.insert(0, '"use client";\n')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print('Fixed: ' + file_path)

app_dir = r'd:\Kuliah\UKM or KSM\AIOT\Website\Vega\vega-frontend\app'
comp_dir = r'd:\Kuliah\UKM or KSM\AIOT\Website\Vega\vega-frontend\components'

for d in [app_dir, comp_dir]:
    for root, dirs, files in os.walk(d):
        for f in files:
            if f.endswith('.ts') or f.endswith('.tsx'):
                fix_use_client(os.path.join(root, f))
