"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

type LicenseType = "mit" | "apache-2.0" | "gpl-3.0" | "bsd-3-clause" | "bsd-2-clause" | "isc" | "unlicense" | "mpl-2.0";

interface LicenseInfo {
  name: string;
  description: string;
  permissions: string[];
  conditions: string[];
  limitations: string[];
  template: (year: string, author: string) => string;
}

const LICENSES: Record<LicenseType, LicenseInfo> = {
  mit: {
    name: "MIT License",
    description: "A short and simple permissive license with conditions only requiring preservation of copyright and license notices.",
    permissions: ["Commercial use", "Modification", "Distribution", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    template: (year, author) => `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  "apache-2.0": {
    name: "Apache License 2.0",
    description: "A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights.",
    permissions: ["Commercial use", "Modification", "Distribution", "Patent use", "Private use"],
    conditions: ["License and copyright notice", "State changes"],
    limitations: ["Liability", "Trademark use", "Warranty"],
    template: (year, author) => `                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to the Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   Copyright ${year} ${author}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.`,
  },
  "gpl-3.0": {
    name: "GNU General Public License v3.0",
    description: "Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications.",
    permissions: ["Commercial use", "Modification", "Distribution", "Patent use", "Private use"],
    conditions: ["License and copyright notice", "State changes", "Disclose source", "Same license"],
    limitations: ["Liability", "Warranty"],
    template: (year, author) => `                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

                            Preamble

  The GNU General Public License is a free, copyleft license for
software and other kinds of works.

  [Full GPL-3.0 text would go here - abbreviated for space]

Copyright ${year} ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`,
  },
  "bsd-3-clause": {
    name: "BSD 3-Clause License",
    description: "A permissive license similar to the BSD 2-Clause License, but with a 3rd clause that prohibits others from using the name of the project or its contributors to promote derived products.",
    permissions: ["Commercial use", "Modification", "Distribution", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    template: (year, author) => `BSD 3-Clause License

Copyright (c) ${year}, ${author}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  "bsd-2-clause": {
    name: "BSD 2-Clause License",
    description: "A permissive license that comes in two variants, the BSD 2-Clause and BSD 3-Clause. Both have very minimal requirements about how the software can be redistributed.",
    permissions: ["Commercial use", "Modification", "Distribution", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    template: (year, author) => `BSD 2-Clause License

Copyright (c) ${year}, ${author}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  isc: {
    name: "ISC License",
    description: "A permissive license lets people do anything with your code with proper attribution and without warranty. The ISC license is functionally equivalent to the BSD 2-Clause and MIT licenses.",
    permissions: ["Commercial use", "Modification", "Distribution", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    template: (year, author) => `ISC License

Copyright (c) ${year}, ${author}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`,
  },
  unlicense: {
    name: "The Unlicense",
    description: "A license with no conditions whatsoever which dedicates works to the public domain. Unlicensed works, modifications, and larger works may be distributed under different terms and without source code.",
    permissions: ["Commercial use", "Modification", "Distribution", "Private use"],
    conditions: [],
    limitations: ["Liability", "Warranty"],
    template: () => `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>`,
  },
  "mpl-2.0": {
    name: "Mozilla Public License 2.0",
    description: "Permissions of this weak copyleft license are conditioned on making available source code of licensed files and modifications of those files under the same license.",
    permissions: ["Commercial use", "Modification", "Distribution", "Patent use", "Private use"],
    conditions: ["Disclose source", "License and copyright notice", "Same license (file)"],
    limitations: ["Liability", "Trademark use", "Warranty"],
    template: (year, author) => `Mozilla Public License Version 2.0
==================================

1. Definitions
--------------

[Full MPL-2.0 text would go here - abbreviated for space]

Copyright ${year} ${author}

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.`,
  },
};

export function LicenseGeneratorTool() {
  const t = useTranslations("toolUI.license-generator");
  const currentYear = new Date().getFullYear().toString();
  const [licenseType, setLicenseType] = useState<LicenseType>("mit");
  const [year, setYear] = useState(currentYear);
  const [author, setAuthor] = useState("");
  const [output, setOutput] = useState("");

  const selectedLicense = LICENSES[licenseType];

  const handleGenerate = () => {
    const authorName = author.trim() || "[Author Name]";
    const licenseYear = year.trim() || currentYear;
    const licenseText = selectedLicense.template(licenseYear, authorName);
    setOutput(licenseText);
  };

  const handleReset = () => {
    setLicenseType("mit");
    setYear(currentYear);
    setAuthor("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* License Selection */}
      <div>
        <Label className="mb-2 block text-sm">{t("selectLicense")}</Label>
        <select
          value={licenseType}
          onChange={(e) => setLicenseType(e.target.value as LicenseType)}
          className="flex h-11 w-full rounded-[var(--radius-12)] bg-[var(--color-gray-0)] px-4 text-sm text-[var(--color-gray-950)] border border-[var(--color-gray-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20 focus-visible:border-[var(--color-blue-500)]"
        >
          {Object.entries(LICENSES).map(([key, license]) => (
            <option key={key} value={key}>
              {license.name}
            </option>
          ))}
        </select>
      </div>

      {/* License Info */}
      <div className="p-4 rounded-[12px] bg-[var(--color-gray-50)] border border-[var(--color-gray-200)]">
        <p className="text-sm text-[var(--color-gray-700)] mb-3">{selectedLicense.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <Label className="text-[var(--color-green-600)] mb-1 block">{t("permissions")}</Label>
            <ul className="space-y-0.5">
              {selectedLicense.permissions.map((p) => (
                <li key={p} className="text-[var(--color-gray-600)]">+ {p}</li>
              ))}
            </ul>
          </div>
          <div>
            <Label className="text-[var(--color-blue-600)] mb-1 block">{t("conditions")}</Label>
            <ul className="space-y-0.5">
              {selectedLicense.conditions.length > 0 ? (
                selectedLicense.conditions.map((c) => (
                  <li key={c} className="text-[var(--color-gray-600)]">= {c}</li>
                ))
              ) : (
                <li className="text-[var(--color-gray-400)]">{t("none")}</li>
              )}
            </ul>
          </div>
          <div>
            <Label className="text-[var(--color-red-600)] mb-1 block">{t("limitations")}</Label>
            <ul className="space-y-0.5">
              {selectedLicense.limitations.map((l) => (
                <li key={l} className="text-[var(--color-gray-600)]">- {l}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Year and Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("yearLabel")}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder={currentYear}
        />
        <Input
          label={t("authorLabel")}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={t("authorPlaceholder")}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleGenerate} variant="primary" className="flex-1">
          {t("generate")}
        </Button>
        <Button onClick={handleReset} variant="secondary">
          {t("reset")}
        </Button>
      </div>

      {/* Output */}
      {output && (
        <Textarea
          label={t("outputLabel")}
          value={output}
          readOnly
          showCopy
          className="font-mono min-h-[400px] text-sm"
        />
      )}
    </div>
  );
}

export const licenseGeneratorConfig: ToolConfig = {
  id: "license-generator",
  name: "License Generator",
  description: "Generate open source license files for your projects",
  category: "generators",
  component: LicenseGeneratorTool,
  seo: {
    keywords: [
      "license generator",
      "open source license",
      "mit license generator",
      "apache license",
      "gpl license",
      "bsd license",
      "license creator",
      "software license",
      "license maker",
      "license template",
      "github license",
      "project license",
    ],
  },
  sections: [
    {
      title: "What is an Open Source License?",
      content:
        "An open source license is a legal document that defines how others can use, modify, and distribute your software. Choosing the right license is important as it determines what others can and cannot do with your code, and protects both you and users of your software.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Popular Licenses</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>MIT:</strong> Simple and permissive, allows almost anything</li>
            <li><strong>Apache 2.0:</strong> Permissive with patent protection</li>
            <li><strong>GPL 3.0:</strong> Copyleft, requires derivative works to be open source</li>
            <li><strong>BSD:</strong> Permissive, similar to MIT with variations</li>
            <li><strong>ISC:</strong> Simplified BSD-style license</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Choosing a License</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Want simplicity? Use MIT or ISC</li>
            <li>Need patent protection? Use Apache 2.0</li>
            <li>Want to ensure derivatives stay open source? Use GPL</li>
            <li>Want to release to public domain? Use Unlicense</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "MIT License header",
      content: "MIT License\n\nCopyright (c) 2024 John Doe\n\nPermission is hereby granted...",
      type: "code",
    },
    {
      title: "Apache 2.0 notice",
      content: "Licensed under the Apache License, Version 2.0",
      type: "text",
    },
  ],
  codeSnippet: `// License Generator

interface License {
  name: string;
  template: (year: string, author: string) => string;
}

const licenses: Record<string, License> = {
  mit: {
    name: 'MIT License',
    template: (year, author) => \`MIT License

Copyright (c) \${year} \${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.\`
  },
  isc: {
    name: 'ISC License',
    template: (year, author) => \`ISC License

Copyright (c) \${year}, \${author}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS.\`
  }
};

function generateLicense(type: string, year: string, author: string): string {
  const license = licenses[type];
  if (!license) throw new Error(\`Unknown license type: \${type}\`);
  return license.template(year, author);
}

// Example usage
const mitLicense = generateLicense('mit', '2024', 'John Doe');
console.log(mitLicense);`,
  references: [
    {
      title: "Choose a License",
      url: "https://choosealicense.com/",
    },
    {
      title: "Open Source Initiative - Licenses",
      url: "https://opensource.org/licenses/",
    },
    {
      title: "GitHub - Licensing a Repository",
      url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository",
    },
  ],
};
