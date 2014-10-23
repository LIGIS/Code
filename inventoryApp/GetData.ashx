<%@ WebHandler Language="C#" Class="GetData" %>

using System;
using System.Text;
using System.Web;

public class GetData : IHttpHandler {
    DataAccess Access = new DataAccess();

    public void ProcessRequest (HttpContext context) {
        string type = HttpUtility.UrlDecode(context.Request["type"]);
        string layer = HttpUtility.UrlDecode(context.Request["layer"]);
        string values = HttpUtility.UrlDecode(context.Request["vals"]);
        
        string results = null;
        if (type == "load")
        {
            results = Access.loadLayer(layer);

        } else if (type == "update")
        {
            results = Access.updateLayer(values, layer);

        }
        else if (type == "delete")
        {
            results = Access.deleteLayer(layer, values);

        }
        context.Response.ContentType = "application/json";
        context.Response.ContentEncoding = Encoding.UTF8;
        context.Response.Write(results);
        
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}