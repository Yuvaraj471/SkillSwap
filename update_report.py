import os
import glob
import html
from xml.sax.saxutils import escape
from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_code_paragraph(line_text, is_first=False, is_last=False):
    top_bdr = '<w:top w:val="single" w:color="A6A6A6" w:sz="4" w:space="4"/>' if is_first else ''
    bottom_bdr = '<w:bottom w:val="single" w:color="A6A6A6" w:sz="4" w:space="4"/>' if is_last else ''
    
    # Replace tabs with 2 spaces for consistent code formatting in Word
    formatted_line = line_text.rstrip('\r\n').replace('\t', '  ')
    escaped_text = escape(formatted_line)
    
    xml = f'''
    <w:p {nsdecls("w")} {nsdecls("w14")}>
      <w:pPr>
        <w:keepLines/>
        <w:pBdr>
          {top_bdr}
          <w:left w:val="single" w:color="A6A6A6" w:sz="4" w:space="4"/>
          {bottom_bdr}
          <w:right w:val="single" w:color="A6A6A6" w:sz="4" w:space="4"/>
        </w:pBdr>
        <w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>
        <w:spacing w:line="240" w:lineRule="auto" w:before="0" w:after="0"/>
        <w:ind w:left="120" w:right="120"/>
        <w:rPr>
          <w:sz w:val="18"/>
          <w:szCs w:val="18"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:eastAsia="Courier New" w:cs="Courier New"/>
          <w:sz w:val="18"/>
          <w:szCs w:val="18"/>
        </w:rPr>
        <w:t xml:space="preserve">{escaped_text}</w:t>
      </w:r>
    </w:p>
    '''
    return parse_xml(xml)

def create_table_cell_xml(text, width_dxa):
    escaped_text = escape(text)
    xml = f'''
    <w:tc {nsdecls("w")} {nsdecls("w14")}>
      <w:tcPr>
        <w:tcW w:w="{width_dxa}" w:type="dxa"/>
        <w:tcBorders>
          <w:top w:val="single" w:color="000000" w:sz="4" w:space="0"/>
          <w:left w:val="single" w:color="000000" w:sz="4" w:space="0"/>
          <w:bottom w:val="single" w:color="000000" w:sz="4" w:space="0"/>
          <w:right w:val="single" w:color="000000" w:sz="4" w:space="0"/>
        </w:tcBorders>
        <w:tcMar>
          <w:top w:w="50" w:type="dxa"/>
          <w:left w:w="100" w:type="dxa"/>
          <w:bottom w:w="50" w:type="dxa"/>
          <w:right w:w="100" w:type="dxa"/>
        </w:tcMar>
        <w:vAlign w:val="center"/>
      </w:tcPr>
      <w:p>
        <w:pPr>
          <w:rPr>
            <w:sz w:val="18"/>
            <w:szCs w:val="18"/>
          </w:rPr>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
            <w:sz w:val="18"/>
            <w:szCs w:val="18"/>
          </w:rPr>
          <w:t xml:space="preserve">{escaped_text}</w:t>
        </w:r>
      </w:p>
    </w:tc>
    '''
    return parse_xml(xml)

def process_document(doc_path):
    print(f"Processing: {doc_path}")
    doc = Document(doc_path)
    
    # 1. Update Note before Table 5.1
    for p in doc.paragraphs:
        if "SkillSwap source code was not available" in p.text:
            p.text = "The API endpoints of the SkillSwap platform implemented in the Express backend are detailed in Table 5.1 below."
            break
            
    # 2. Update Table 5.1 (API Endpoints)
    endpoints_data = [
        ("POST", "/api/auth/register", "Register a new student account", "Public"),
        ("POST", "/api/auth/login", "Authenticate user and issue JWT token", "Public"),
        ("POST", "/api/auth/logout", "Clear authenticated user session token", "Protected"),
        ("GET", "/api/auth/me", "Get details of currently logged-in user", "Protected"),
        ("GET", "/api/users", "Get student directory with skill and availability filters", "Public / Protected"),
        ("POST", "/api/users/skills", "Add a new technical/non-technical skill to user profile", "Protected"),
        ("DELETE", "/api/users/skills/:skillName", "Remove a skill from user profile", "Protected"),
        ("GET", "/api/users/:id", "Get user profile details by student ID", "Public / Protected"),
        ("PUT", "/api/users/:id", "Update user profile details, social links & achievements", "Protected"),
        ("GET", "/api/skills", "Get list of predefined platform skills", "Public"),
        ("GET", "/api/matches", "Get recommended project partners matched by skill overlap", "Protected"),
        ("POST", "/api/matches", "Calculate skill match percentage for project requirements", "Public / Protected"),
        ("GET", "/api/projects", "Search and list projects with filters", "Public / Protected"),
        ("POST", "/api/projects", "Create a new project with required skills & deadline", "Protected"),
        ("GET", "/api/projects/:id", "Get detailed project information and team members", "Public / Protected"),
        ("PUT", "/api/projects/:id", "Update project details, team size or deadline", "Protected"),
        ("DELETE", "/api/projects/:id", "Delete a project listing", "Protected"),
        ("POST", "/api/projects/:id/join", "Send join request to project owner", "Protected"),
        ("POST", "/api/projects/:id/invite", "Send project invitation to a student", "Protected"),
        ("POST", "/api/requests", "Send collaboration request to another student", "Protected"),
        ("GET", "/api/requests/received", "Get list of received collaboration requests", "Protected"),
        ("GET", "/api/requests/sent", "Get list of sent collaboration requests", "Protected"),
        ("PUT", "/api/requests/:id", "Accept or reject collaboration request", "Protected"),
        ("POST", "/api/skill-swaps", "Propose a skill exchange proposal to a peer", "Protected"),
        ("GET", "/api/skill-swaps", "Get user's sent and received Skill Swap proposals", "Protected"),
        ("PUT", "/api/skill-swaps/:id", "Accept or reject Skill Swap proposal", "Protected"),
        ("GET", "/api/messages/:userId", "Get direct message conversation history with user", "Protected"),
        ("POST", "/api/messages", "Send direct message to a connected student", "Protected"),
        ("GET", "/api/notifications", "Fetch notifications for authenticated user", "Protected"),
        ("PUT", "/api/notifications/read-all", "Mark all user notifications as read", "Protected"),
        ("PUT", "/api/notifications/:id/read", "Mark individual notification as read", "Protected"),
        ("POST", "/api/reports", "Submit report for a user or project moderation", "Protected"),
        ("GET", "/api/reports", "Get all submitted platform reports", "Admin"),
        ("PUT", "/api/reports/:id", "Update report resolution status", "Admin"),
        ("GET", "/api/admin/stats", "Get platform statistics overview for dashboard", "Admin"),
        ("GET", "/api/admin/users", "Get all registered users for administration", "Admin"),
        ("PUT", "/api/admin/users/:id/disable", "Toggle enable/disable status of user account", "Admin"),
        ("DELETE", "/api/admin/users/:id", "Permanently delete user account", "Admin"),
        ("GET", "/api/admin/projects", "Get all projects for administration", "Admin"),
        ("DELETE", "/api/admin/projects/:id", "Delete project listing (admin action)", "Admin"),
    ]
    
    # Locate Table 13 (API Endpoints table)
    t = None
    for table in doc.tables:
        if len(table.rows) > 0 and "Method" in table.rows[0].cells[0].text:
            t = table
            break
            
    if t:
        # Clear existing placeholder rows (row 1 onwards)
        tr_list = list(t._tbl)
        header_tr = t.rows[0]._tr
        for r in list(t.rows)[1:]:
            t._tbl.remove(r._tr)
            
        col_widths = [1100, 3400, 2866, 1200]
        
        for row_data in endpoints_data:
            tr_xml = f'<w:tr {nsdecls("w")}/>'
            tr = parse_xml(tr_xml)
            for c_idx, val in enumerate(row_data):
                cell_xml = create_table_cell_xml(val, col_widths[c_idx])
                tr.append(cell_xml)
            t._tbl.append(tr)
            
    # 3. Replace Code Placeholders
    code_mappings = [
        # (header search text, source file path)
        ("// 1. Server configuration", "e:/SkillSwap/server/server.js"),
        ("// 2. User model", "e:/SkillSwap/server/models/User.js"),
        ("// 3. Authentication controller", "e:/SkillSwap/server/controllers/authController.js"),
        ("// 4. Authentication middleware", "e:/SkillSwap/server/middleware/authMiddleware.js"),
        ("// 5. Project model", "e:/SkillSwap/server/models/Project.js"),
        ("// 6. Matching logic", "e:/SkillSwap/server/utils/matchCalculator.js"),
        ("// 7. Collaboration request logic", "e:/SkillSwap/server/controllers/requestController.js"),
        ("// 8. Skill Swap logic", "e:/SkillSwap/server/controllers/skillSwapController.js"),
        ("// 9. Message logic", "e:/SkillSwap/server/controllers/messageController.js"),
        ("// 10. Notification logic", "e:/SkillSwap/server/controllers/notificationController.js"),
        ("// 1. Login component", "e:/SkillSwap/client/src/pages/LoginPage.jsx"),
        ("// 2. Dashboard component", "e:/SkillSwap/client/src/pages/StudentDashboard.jsx"),
        ("// 3. Partner matching component", "e:/SkillSwap/client/src/pages/PartnerFinderPage.jsx"),
        ("// 4. Project creation component", "e:/SkillSwap/client/src/pages/ProjectsPage.jsx"),
        ("// 5. Skill Swap component", "e:/SkillSwap/client/src/pages/SkillSwapPage.jsx"),
        ("// 6. Messaging component", "e:/SkillSwap/client/src/components/MessageDrawer.jsx"),
    ]
    
    for header_text, src_path in code_mappings:
        if not os.path.exists(src_path):
            print(f"Error: source file {src_path} not found!")
            continue
            
        with open(src_path, "r", encoding="utf-8") as f:
            code_lines = [line.rstrip("\r\n") for line in f.readlines()]
            
        # Find header paragraph index
        header_idx = -1
        for idx, p in enumerate(doc.paragraphs):
            if header_text in p.text:
                header_idx = idx
                break
                
        if header_idx != -1:
            # The placeholder lines follow the header paragraph
            # We remove the placeholder paragraphs (usually 2 paragraphs containing INSERT ACTUAL)
            to_remove = []
            scan_idx = header_idx + 1
            while scan_idx < len(doc.paragraphs):
                p_text = doc.paragraphs[scan_idx].text
                if "INSERT ACTUAL" in p_text or "source code not yet provided" in p_text or p_text.strip() == "":
                    to_remove.append(doc.paragraphs[scan_idx])
                    scan_idx += 1
                else:
                    break
                    
            target_p = doc.paragraphs[header_idx]
            parent = target_p._p.getparent()
            target_pos = parent.index(target_p._p)
            
            # Remove placeholder paragraphs
            for p in to_remove:
                p._p.getparent().remove(p._p)
                
            # Insert code paragraphs after header paragraph
            insert_pos = target_pos + 1
            num_lines = len(code_lines)
            for l_idx, line in enumerate(code_lines):
                is_first = (l_idx == 0)
                is_last = (l_idx == num_lines - 1)
                code_p = create_code_paragraph(line, is_first=is_first, is_last=is_last)
                parent.insert(insert_pos + l_idx, code_p)
                
            print(f"Inserted {num_lines} lines of code for '{header_text}' from {os.path.basename(src_path)}")

    doc.save(doc_path)
    print(f"Successfully saved updated docx to {doc_path}")

if __name__ == "__main__":
    docs = [
        "C:/Users/Lenovo/Downloads/SkillSwap_Project_Report_Yuvaraj_D (2) (2).docx",
        "C:/Users/Lenovo/Downloads/SkillSwap_Project_Report_Yuvaraj_D.docx"
    ]
    for d in docs:
        if os.path.exists(d):
            process_document(d)
