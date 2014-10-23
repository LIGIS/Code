<%@ WebHandler Language="C#" Class="credentials" %>

using System;
using System.Web;

public class credentials : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string u = HttpUtility.UrlDecode(context.Request["user"]).ToString();
        string p = HttpUtility.UrlDecode(context.Request["pass"]);
        string sender = HttpUtility.UrlDecode(context.Request["sender"]);
        string results = "";
        
        if (sender == "edit")
        {
            if ((u.ToUpper() == "") && p == "")
            {
                results = "{\"items\":\"t\"}";
            }
            else {
                results = "{\"items\":\"f\"}";
            }
        }
        
        context.Response.ContentType = "application/json";
        context.Response.ContentEncoding = System.Text.Encoding.UTF8;

        context.Response.Write(results);
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }
}