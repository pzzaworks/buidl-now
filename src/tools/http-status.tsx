"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

interface StatusCode {
  code: number;
  name: string;
  description: string;
  category: string;
}

const HTTP_STATUS_CODES: StatusCode[] = [
  // 1xx Informational
  { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed to send the request body.", category: "1xx Informational" },
  { code: 101, name: "Switching Protocols", description: "The server is switching protocols as requested by the client.", category: "1xx Informational" },
  { code: 102, name: "Processing", description: "The server has received and is processing the request, but no response is available yet.", category: "1xx Informational" },
  { code: 103, name: "Early Hints", description: "Used to return some response headers before final HTTP message.", category: "1xx Informational" },

  // 2xx Success
  { code: 200, name: "OK", description: "The request has succeeded. The meaning depends on the HTTP method used.", category: "2xx Success" },
  { code: 201, name: "Created", description: "The request has been fulfilled and a new resource has been created.", category: "2xx Success" },
  { code: 202, name: "Accepted", description: "The request has been accepted for processing, but processing has not been completed.", category: "2xx Success" },
  { code: 203, name: "Non-Authoritative Information", description: "The returned metadata is not exactly the same as available from the origin server.", category: "2xx Success" },
  { code: 204, name: "No Content", description: "The server successfully processed the request but is not returning any content.", category: "2xx Success" },
  { code: 205, name: "Reset Content", description: "The server successfully processed the request and is asking the client to reset the document view.", category: "2xx Success" },
  { code: 206, name: "Partial Content", description: "The server is delivering only part of the resource due to a range header sent by the client.", category: "2xx Success" },
  { code: 207, name: "Multi-Status", description: "The message body contains multiple status codes for multiple independent operations.", category: "2xx Success" },
  { code: 208, name: "Already Reported", description: "The members of a DAV binding have already been enumerated in a previous reply.", category: "2xx Success" },
  { code: 226, name: "IM Used", description: "The server has fulfilled a GET request and the response is a representation of one or more instance-manipulations.", category: "2xx Success" },

  // 3xx Redirection
  { code: 300, name: "Multiple Choices", description: "The request has more than one possible response. The user or user agent should choose one.", category: "3xx Redirection" },
  { code: 301, name: "Moved Permanently", description: "The URL of the requested resource has been changed permanently. The new URL is given in the response.", category: "3xx Redirection" },
  { code: 302, name: "Found", description: "The URI of requested resource has been changed temporarily. Further changes might be made in the future.", category: "3xx Redirection" },
  { code: 303, name: "See Other", description: "The server sent this response to direct the client to get the requested resource at another URI with a GET request.", category: "3xx Redirection" },
  { code: 304, name: "Not Modified", description: "Used for caching. The response has not been modified, so the client can use the cached version.", category: "3xx Redirection" },
  { code: 305, name: "Use Proxy", description: "The requested resource is available only through a proxy. Deprecated due to security concerns.", category: "3xx Redirection" },
  { code: 307, name: "Temporary Redirect", description: "The server sends this response to direct the client to get the resource at another URI with the same method.", category: "3xx Redirection" },
  { code: 308, name: "Permanent Redirect", description: "The resource is now permanently located at another URI, specified by the Location header.", category: "3xx Redirection" },

  // 4xx Client Error
  { code: 400, name: "Bad Request", description: "The server cannot process the request due to a client error (e.g., malformed request syntax).", category: "4xx Client Error" },
  { code: 401, name: "Unauthorized", description: "Authentication is required and has failed or has not been provided.", category: "4xx Client Error" },
  { code: 402, name: "Payment Required", description: "Reserved for future use. Originally intended for digital payment systems.", category: "4xx Client Error" },
  { code: 403, name: "Forbidden", description: "The server understood the request but refuses to authorize it.", category: "4xx Client Error" },
  { code: 404, name: "Not Found", description: "The server cannot find the requested resource. The URL is not recognized.", category: "4xx Client Error" },
  { code: 405, name: "Method Not Allowed", description: "The request method is not supported for the requested resource.", category: "4xx Client Error" },
  { code: 406, name: "Not Acceptable", description: "The resource is not available in a format that would be acceptable according to the Accept headers.", category: "4xx Client Error" },
  { code: 407, name: "Proxy Authentication Required", description: "The client must first authenticate itself with the proxy.", category: "4xx Client Error" },
  { code: 408, name: "Request Timeout", description: "The server timed out waiting for the request.", category: "4xx Client Error" },
  { code: 409, name: "Conflict", description: "The request conflicts with the current state of the server.", category: "4xx Client Error" },
  { code: 410, name: "Gone", description: "The resource requested is no longer available and will not be available again.", category: "4xx Client Error" },
  { code: 411, name: "Length Required", description: "The request did not specify the length of its content, which is required.", category: "4xx Client Error" },
  { code: 412, name: "Precondition Failed", description: "The server does not meet one of the preconditions specified in the request headers.", category: "4xx Client Error" },
  { code: 413, name: "Payload Too Large", description: "The request entity is larger than limits defined by server.", category: "4xx Client Error" },
  { code: 414, name: "URI Too Long", description: "The URI requested by the client is longer than the server is willing to interpret.", category: "4xx Client Error" },
  { code: 415, name: "Unsupported Media Type", description: "The media format of the requested data is not supported by the server.", category: "4xx Client Error" },
  { code: 416, name: "Range Not Satisfiable", description: "The range specified by the Range header cannot be fulfilled.", category: "4xx Client Error" },
  { code: 417, name: "Expectation Failed", description: "The expectation indicated by the Expect header cannot be met by the server.", category: "4xx Client Error" },
  { code: 418, name: "I'm a Teapot", description: "The server refuses to brew coffee because it is a teapot (April Fools' joke, RFC 2324).", category: "4xx Client Error" },
  { code: 421, name: "Misdirected Request", description: "The request was directed at a server that is not able to produce a response.", category: "4xx Client Error" },
  { code: 422, name: "Unprocessable Entity", description: "The request was well-formed but was unable to be followed due to semantic errors.", category: "4xx Client Error" },
  { code: 423, name: "Locked", description: "The resource that is being accessed is locked.", category: "4xx Client Error" },
  { code: 424, name: "Failed Dependency", description: "The request failed because it depended on another request and that request failed.", category: "4xx Client Error" },
  { code: 425, name: "Too Early", description: "The server is unwilling to risk processing a request that might be replayed.", category: "4xx Client Error" },
  { code: 426, name: "Upgrade Required", description: "The client should switch to a different protocol.", category: "4xx Client Error" },
  { code: 428, name: "Precondition Required", description: "The origin server requires the request to be conditional.", category: "4xx Client Error" },
  { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given amount of time (rate limiting).", category: "4xx Client Error" },
  { code: 431, name: "Request Header Fields Too Large", description: "The server is unwilling to process the request because its header fields are too large.", category: "4xx Client Error" },
  { code: 451, name: "Unavailable For Legal Reasons", description: "The resource is not available due to legal reasons (e.g., censorship).", category: "4xx Client Error" },

  // 5xx Server Error
  { code: 500, name: "Internal Server Error", description: "The server has encountered a situation it doesn't know how to handle.", category: "5xx Server Error" },
  { code: 501, name: "Not Implemented", description: "The request method is not supported by the server and cannot be handled.", category: "5xx Server Error" },
  { code: 502, name: "Bad Gateway", description: "The server, while acting as a gateway, received an invalid response from the upstream server.", category: "5xx Server Error" },
  { code: 503, name: "Service Unavailable", description: "The server is not ready to handle the request. Common causes are maintenance or overloading.", category: "5xx Server Error" },
  { code: 504, name: "Gateway Timeout", description: "The server, while acting as a gateway, did not get a response in time from the upstream server.", category: "5xx Server Error" },
  { code: 505, name: "HTTP Version Not Supported", description: "The HTTP version used in the request is not supported by the server.", category: "5xx Server Error" },
  { code: 506, name: "Variant Also Negotiates", description: "The server has an internal configuration error: transparent content negotiation results in a circular reference.", category: "5xx Server Error" },
  { code: 507, name: "Insufficient Storage", description: "The server is unable to store the representation needed to complete the request.", category: "5xx Server Error" },
  { code: 508, name: "Loop Detected", description: "The server detected an infinite loop while processing the request.", category: "5xx Server Error" },
  { code: 510, name: "Not Extended", description: "Further extensions to the request are required for the server to fulfill it.", category: "5xx Server Error" },
  { code: 511, name: "Network Authentication Required", description: "The client needs to authenticate to gain network access.", category: "5xx Server Error" },
];

const CATEGORIES = ["All", "1xx Informational", "2xx Success", "3xx Redirection", "4xx Client Error", "5xx Server Error"];

const CATEGORY_COLORS: Record<string, string> = {
  "1xx Informational": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "2xx Success": "bg-green-500/10 text-[var(--color-green-500)] border-green-500/30",
  "3xx Redirection": "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  "4xx Client Error": "bg-orange-500/10 text-orange-600 border-orange-500/30",
  "5xx Server Error": "bg-red-500/10 text-[var(--color-red-500)] border-red-500/30",
};

export function HttpStatusTool() {
  const t = useTranslations("toolUI.http-status");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCode, setExpandedCode] = useState<number | null>(null);

  const filteredCodes = useMemo(() => {
    return HTTP_STATUS_CODES.filter((status) => {
      const matchesSearch =
        search === "" ||
        status.code.toString().includes(search) ||
        status.name.toLowerCase().includes(search.toLowerCase()) ||
        status.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || status.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const groupedCodes = useMemo(() => {
    const groups: Record<string, StatusCode[]> = {};
    filteredCodes.forEach((status) => {
      if (!groups[status.category]) {
        groups[status.category] = [];
      }
      groups[status.category].push(status);
    });
    return groups;
  }, [filteredCodes]);

  const handleReset = () => {
    setSearch("");
    setSelectedCategory("All");
    setExpandedCode(null);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="mb-2 block text-sm">{t("searchLabel")}</Label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="text-sm"
        />
      </div>

      {/* Category Filter */}
      <div>
        <Label className="mb-2 block text-sm">{t("filterLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "primary" : "secondary"}
              size="sm"
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button onClick={handleReset} className="w-full">
        {t("resetFilters")}
      </Button>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {t("showing", { count: filteredCodes.length, total: HTTP_STATUS_CODES.length })}
      </div>

      {/* Status Code List */}
      <div className="space-y-6">
        {Object.entries(groupedCodes).map(([category, codes]) => (
          <div key={category}>
            <div className={`text-sm font-semibold mb-3 px-3 py-1 rounded-[8px] inline-block ${CATEGORY_COLORS[category] || ""}`}>
              {category}
            </div>
            <div className="space-y-2">
              {codes.map((status) => (
                <div
                  key={status.code}
                  className={`border border-border rounded-[12px] overflow-hidden transition-all cursor-pointer ${
                    expandedCode === status.code ? "bg-[var(--color-gray-0)]" : ""
                  }`}
                  onClick={() => setExpandedCode(expandedCode === status.code ? null : status.code)}
                >
                  <div className="flex items-center gap-3 p-3">
                    <span className={`font-mono font-bold text-lg min-w-[50px] ${
                      status.category.startsWith("2") ? "text-[var(--color-green-500)]" :
                      status.category.startsWith("3") ? "text-yellow-600" :
                      status.category.startsWith("4") ? "text-orange-600" :
                      status.category.startsWith("5") ? "text-[var(--color-red-500)]" :
                      "text-blue-600"
                    }`}>
                      {status.code}
                    </span>
                    <span className="font-medium flex-1">{status.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {expandedCode === status.code ? t("collapse") : t("expand")}
                    </span>
                  </div>
                  {expandedCode === status.code && (
                    <div className="px-3 pb-3 pt-0">
                      <p className="text-sm text-muted-foreground pl-[62px]">
                        {status.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredCodes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {t("noResults")}
        </div>
      )}
    </div>
  );
}

export const httpStatusConfig: ToolConfig = {
  id: "http-status",
  name: "HTTP Status Code Reference",
  description: "Searchable reference for HTTP status codes with descriptions",
  category: "utilities",
  component: HttpStatusTool,
  seo: {
    keywords: [
      "http status codes",
      "http response codes",
      "status code reference",
      "http error codes",
      "200 ok",
      "404 not found",
      "500 internal server error",
      "http status list",
      "rest api status codes",
      "http response status",
      "web status codes",
      "api response codes",
      "http codes meaning",
      "status code lookup",
      "http status code list",
    ],
  },
  sections: [
    {
      title: "What are HTTP Status Codes?",
      content:
        "HTTP status codes are three-digit numbers returned by servers to indicate the result of a client's request. They help communicate whether a request was successful, redirected, or encountered an error. Understanding these codes is essential for web development and API integration.",
    },
    {
      title: "Status Code Categories",
      content: (
        <>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-blue-600">1xx Informational</strong> - Request received, continuing process</li>
            <li><strong className="text-[var(--color-green-500)]">2xx Success</strong> - Request successfully received, understood, and accepted</li>
            <li><strong className="text-yellow-600">3xx Redirection</strong> - Further action needed to complete the request</li>
            <li><strong className="text-orange-600">4xx Client Error</strong> - Request contains bad syntax or cannot be fulfilled</li>
            <li><strong className="text-[var(--color-red-500)]">5xx Server Error</strong> - Server failed to fulfill a valid request</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Most Common Codes",
      content: "200 OK, 201 Created, 301 Moved, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error",
      type: "text",
    },
    {
      title: "REST API Success",
      content: "GET: 200, POST: 201, PUT: 200/204, DELETE: 204",
      type: "code",
    },
  ],
  codeSnippet: `// HTTP Status Code reference in TypeScript
// No external dependencies required

interface StatusCode {
  code: number;
  name: string;
  description: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
}

const HTTP_STATUS_CODES: StatusCode[] = [
  // 2xx Success
  { code: 200, name: 'OK', description: 'Request succeeded', category: '2xx' },
  { code: 201, name: 'Created', description: 'Resource created', category: '2xx' },
  { code: 204, name: 'No Content', description: 'Success with no body', category: '2xx' },

  // 3xx Redirection
  { code: 301, name: 'Moved Permanently', description: 'Resource moved', category: '3xx' },
  { code: 302, name: 'Found', description: 'Temporary redirect', category: '3xx' },
  { code: 304, name: 'Not Modified', description: 'Use cached version', category: '3xx' },

  // 4xx Client Error
  { code: 400, name: 'Bad Request', description: 'Invalid request', category: '4xx' },
  { code: 401, name: 'Unauthorized', description: 'Auth required', category: '4xx' },
  { code: 403, name: 'Forbidden', description: 'Access denied', category: '4xx' },
  { code: 404, name: 'Not Found', description: 'Resource not found', category: '4xx' },
  { code: 429, name: 'Too Many Requests', description: 'Rate limited', category: '4xx' },

  // 5xx Server Error
  { code: 500, name: 'Internal Server Error', description: 'Server error', category: '5xx' },
  { code: 502, name: 'Bad Gateway', description: 'Invalid upstream response', category: '5xx' },
  { code: 503, name: 'Service Unavailable', description: 'Server overloaded', category: '5xx' },
];

function getStatusCode(code: number): StatusCode | undefined {
  return HTTP_STATUS_CODES.find(s => s.code === code);
}

function isSuccess(code: number): boolean {
  return code >= 200 && code < 300;
}

function isClientError(code: number): boolean {
  return code >= 400 && code < 500;
}

function isServerError(code: number): boolean {
  return code >= 500 && code < 600;
}

// Example usage
const status = getStatusCode(404);
if (status) {
  console.log(\`\${status.code} \${status.name}: \${status.description}\`);
  // Output: 404 Not Found: Resource not found
}

console.log('Is 200 success?', isSuccess(200));  // true
console.log('Is 404 client error?', isClientError(404));  // true
console.log('Is 500 server error?', isServerError(500));  // true

// Filter by category
const clientErrors = HTTP_STATUS_CODES.filter(s => s.category === '4xx');
console.log('Client errors:', clientErrors.map(s => s.code));
// Output: [400, 401, 403, 404, 429]`,
  references: [
    {
      title: "MDN HTTP Status Codes",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
    },
    {
      title: "RFC 9110 - HTTP Semantics",
      url: "https://www.rfc-editor.org/rfc/rfc9110#section-15",
    },
    {
      title: "HTTP Status Dogs",
      url: "https://httpstatusdogs.com/",
    },
  ],
};
